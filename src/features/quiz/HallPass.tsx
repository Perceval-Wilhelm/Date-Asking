"use client";

import { m } from "motion/react";
import { useState } from "react";
import { invitation } from "@/content/invitation";
import { Icon } from "./art";
import { googleCalendarUrl, toIcs, type PlanEvent } from "./calendar";
import { formatDay, formatTime, useEventDay, weekdayName } from "./dates";
import { usePrefs } from "./prefs";
import { answerMessage, downloadFile, shareText, type ShareResult } from "./share";

const statusText: Record<ShareResult, string> = {
  shared: `Sent! ${invitation.from} is going to be so happy ♡`,
  copied: `Copied! Paste it to ${invitation.from} 💌`,
  cancelled: "",
  failed: "",
};

export function HallPass({ live, onRetake }: { live: boolean; onRetake: () => void }) {
  const { time, snack } = usePrefs();
  const day = useEventDay();
  const [status, setStatus] = useState("");
  const timeChoice = invitation.times.find((choice) => choice.id === time) ?? null;
  const snackChoice = invitation.snacks.find((choice) => choice.id === snack) ?? null;
  const dayLabel = day ? formatDay(day) : weekdayName;
  const timeLabel = timeChoice ? formatTime(timeChoice.time) : null;
  const message = answerMessage({
    plan: invitation.plan,
    day: dayLabel,
    time: timeLabel,
    snack: snackChoice,
    from: invitation.from,
  });
  const event: PlanEvent | null = day
    ? {
        title: `${invitation.plan} with ${invitation.from} ♡`,
        details: snackChoice ? `Snack order: ${snackChoice.label} ${snackChoice.emoji}` : "It's a date ♡",
        day,
        time: timeChoice?.time ?? null,
        hours: invitation.hours,
      }
    : null;

  async function tell() {
    const result = await shareText(message);
    setStatus(result === "failed" ? `Send this to ${invitation.from}: “${message}”` : statusText[result]);
  }

  function addToCalendar() {
    if (!event) return;
    const ics = toIcs(event, { uid: `${event.day}-${crypto.randomUUID()}@date-asking`, now: new Date() });
    downloadFile("study-date.ics", ics, "text/calendar;charset=utf-8");
    setStatus("Saved to your downloads. Open it to add the date ♡");
  }

  return (
    <m.div
      className="pass-wrap"
      initial={live ? { opacity: 0, y: 70, rotate: 5 } : false}
      animate={{ opacity: 1, y: 0, rotate: 1 }}
      exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 150, damping: 17, delay: live ? 1.5 : 0 }}
    >
      <div className="pass-shadow">
        <section className="pass" aria-labelledby="pass-title">
          <p className="pass__stub" aria-hidden="true">
            Admit 2 ♡
          </p>
          <div className="pass__main">
            <h2 id="pass-title" className="pass__title">
              Hall pass
            </h2>
            <dl className="pass__details">
              <div>
                <dt>What</dt>
                <dd>{invitation.plan}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {dayLabel} · {timeLabel ?? <span className="pass__pending">time TBD</span>}
                </dd>
              </div>
              <div>
                <dt>Snack</dt>
                <dd>
                  {snackChoice ? (
                    `${snackChoice.label} ${snackChoice.emoji}`
                  ) : (
                    <span className="pass__pending">pick one above ↑</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Signed</dt>
                <dd className="pass__sign">{invitation.from} ♡</dd>
              </div>
            </dl>
            <div className="pass__actions">
              <button type="button" className="btn" onClick={tell}>
                <Icon name="send" /> Tell {invitation.from}
              </button>
              <button type="button" className="btn btn--paper" onClick={addToCalendar} disabled={!event}>
                <Icon name="calendar" /> Add to calendar
              </button>
              {event && (
                <a className="text-link" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">
                  Google Calendar <Icon name="external" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
            <p className="pass__status" role="status">
              {status}
            </p>
          </div>
        </section>
      </div>
      <button type="button" className="retake" onClick={onRetake}>
        <Icon name="retake" /> Retake the quiz
      </button>
    </m.div>
  );
}
