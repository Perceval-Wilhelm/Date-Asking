import { describe, expect, it } from "vitest";
import { googleCalendarUrl, isValidDay, toIcs, upcomingDay, type PlanEvent } from "./calendar";
import { formatDay, formatTime } from "./dates";

const event: PlanEvent = {
  title: "Study date with Thinh ♡",
  details: "Snack order: Bubble tea 🧋",
  day: "2026-11-08",
  time: "14:00",
  hours: 2,
};
const stamp = { uid: "test@date-asking", now: new Date(Date.UTC(2026, 10, 1, 9, 30, 5)) };

describe("upcoming day", () => {
  it("counts today when it is already the day", () => {
    expect(upcomingDay(0, new Date(2026, 10, 1, 23, 59))).toBe("2026-11-01");
  });

  it("finds the next one later in the week and across months", () => {
    expect(upcomingDay(0, new Date(2026, 10, 2, 8))).toBe("2026-11-08");
    expect(upcomingDay(0, new Date(2026, 11, 28))).toBe("2027-01-03");
  });

  it("validates pinned days", () => {
    expect(isValidDay("2026-11-08")).toBe(true);
    expect(isValidDay("2026-02-30")).toBe(false);
    expect(isValidDay("")).toBe(false);
  });
});

describe("calendar file", () => {
  it("writes a floating local event with CRLF line endings", () => {
    const ics = toIcs(event, stamp);
    expect(ics.split("\r\n")).toEqual(
      expect.arrayContaining([
        "BEGIN:VCALENDAR",
        "UID:test@date-asking",
        "DTSTAMP:20261101T093005Z",
        "DTSTART:20261108T140000",
        "DTEND:20261108T160000",
        "SUMMARY:Study date with Thinh ♡",
        "END:VCALENDAR",
      ]),
    );
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("rolls an evening date past midnight into the next day", () => {
    expect(toIcs({ ...event, time: "23:00" }, stamp)).toContain("DTEND:20261109T010000");
  });

  it("writes an all-day event when no time was picked", () => {
    const ics = toIcs({ ...event, time: null }, stamp);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261108");
    expect(ics).toContain("DTEND;VALUE=DATE:20261109");
  });

  it("escapes text and folds long lines without splitting characters", () => {
    const details = `Bring snacks, books; and\nhighlighters ${"🧋".repeat(40)}`;
    const ics = toIcs({ ...event, details }, stamp);
    const lines = ics.split("\r\n");
    const encoder = new TextEncoder();
    expect(lines.every((line) => encoder.encode(line).length <= 75)).toBe(true);
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain(`DESCRIPTION:Bring snacks\\, books\\; and\\nhighlighters ${"🧋".repeat(40)}`);
  });

  it("rejects malformed days and times instead of writing a broken file", () => {
    expect(() => toIcs({ ...event, day: "next week" }, stamp)).toThrow();
    expect(() => toIcs({ ...event, time: "25:00" }, stamp)).toThrow();
  });
});

describe("Google Calendar link", () => {
  it("uses the same wall-clock range as the file", () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20261108T140000/20261108T160000");
    expect(url.searchParams.get("text")).toBe(event.title);
  });
});

describe("labels", () => {
  it("formats days and times the same way on the server and in the browser", () => {
    expect(formatDay("2026-11-08")).toBe("Sun, Nov 8");
    expect(formatTime("14:00")).toBe("2:00 PM");
    expect(formatTime("09:30")).toBe("9:30 AM");
  });
});
