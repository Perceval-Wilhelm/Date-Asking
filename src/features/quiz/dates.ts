import { useSyncExternalStore } from "react";
import { invitation } from "@/content/invitation";
import { isValidDay, upcomingDay } from "./calendar";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const weekdayName = WEEKDAYS[invitation.weekday] ?? "Sunday";

const neverChanges = () => () => {};
const eventDay = () => (isValidDay(invitation.date) ? invitation.date : upcomingDay(invitation.weekday, new Date()));

/** The plan's day as YYYY-MM-DD. Null while server rendering: only the visitor knows their "this Sunday". */
export function useEventDay() {
  return useSyncExternalStore(neverChanges, eventDay, () => null);
}

// Both formatters read wall-clock fields in UTC so server and browser agree on the text.
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

export function formatDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return dayFormat.format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return timeFormat.format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}
