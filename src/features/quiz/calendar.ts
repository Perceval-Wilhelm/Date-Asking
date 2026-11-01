export type PlanEvent = {
  title: string;
  details: string;
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  /** Local start time, HH:MM. Null makes an all-day event. */
  time: string | null;
  hours: number;
};

const pad = (value: number) => String(value).padStart(2, "0");
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isoDay(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The next `weekday` on or after `from`, in the visitor's local calendar. */
export function upcomingDay(weekday: number, from: Date) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  day.setDate(day.getDate() + ((weekday - day.getDay() + 7) % 7));
  return isoDay(day);
}

export function isValidDay(day: string) {
  const match = DAY.exec(day);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Wall-clock arithmetic in UTC fields, so daylight-saving changes never shift a floating time. */
function wallClock(day: string, time: string, addHours = 0) {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh + addHours, mm));
}

const compactDate = (date: Date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
const compactTime = (date: Date) =>
  `${compactDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;

function eventRange(event: PlanEvent) {
  if (!isValidDay(event.day)) throw new Error(`Invalid event day: ${event.day}`);
  if (event.time === null) {
    const start = wallClock(event.day, "00:00");
    return { allDay: true, start: compactDate(start), end: compactDate(wallClock(event.day, "00:00", 24)) };
  }
  if (!TIME.test(event.time)) throw new Error(`Invalid event time: ${event.time}`);
  return {
    allDay: false,
    start: compactTime(wallClock(event.day, event.time)),
    end: compactTime(wallClock(event.day, event.time, event.hours)),
  };
}

const escapeText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 folds lines longer than 75 octets without splitting a character. */
function fold(line: string) {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (octets + size > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
      octets = 0;
    }
    current += char;
    octets += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function toIcs(event: PlanEvent, { uid, now }: { uid: string; now: Date }) {
  const range = eventRange(event);
  const stamp = `${compactTime(now)}Z`;
  const when = range.allDay
    ? [`DTSTART;VALUE=DATE:${range.start}`, `DTEND;VALUE=DATE:${range.end}`]
    : [`DTSTART:${range.start}`, `DTEND:${range.end}`];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Date-Asking//Pop quiz//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(fold)
    .join("\r\n");
}

export function googleCalendarUrl(event: PlanEvent) {
  const range = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${range.start}/${range.end}`,
    details: event.details,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
