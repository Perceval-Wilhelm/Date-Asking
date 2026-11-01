"use client";

import { AnimatePresence, m } from "motion/react";
import type { CSSProperties, Ref } from "react";
import { invitation, type Choice } from "@/content/invitation";
import { Bubble, Grade, PenCheck, PenCircle, PenStrike } from "./art";
import { formatDay, formatTime, useEventDay, weekdayName } from "./dates";
import { isCorrected, noLabel, noScale, parseQuestion, score, yesScale, type QuizState } from "./logic";
import { prefs, usePrefs } from "./prefs";
import { sfx } from "./sound";
import { StickerSlot } from "./Sticker";

const question = parseQuestion(invitation.question);
const scale = (value: number) => ({ "--scale": value }) as CSSProperties;

type Props = {
  ref: Ref<HTMLElement>;
  state: QuizState;
  /** False while showing a server-rendered answer, so nothing replays on load. */
  live: boolean;
  onNo: () => void;
  onYes: (from: DOMRect) => void;
};

export function Sheet({ ref, state, live, onNo, onYes }: Props) {
  const { time, snack } = usePrefs();
  const day = useEventDay();
  const corrected = isCorrected(state);
  const total = score(state.answered, Number(time !== null) + Number(snack !== null));

  return (
    <m.article
      ref={ref}
      className="sheet"
      aria-labelledby="quiz-title"
      initial={live ? { opacity: 0, y: 56, rotate: -7, scale: 0.86 } : false}
      animate={{ opacity: 1, y: 0, rotate: -0.6, scale: 1 }}
      transition={{ type: "spring", stiffness: 190, damping: 20 }}
    >
      <span className="sheet__margin" aria-hidden="true" />
      <header className="sheet__head">
        <h1 id="quiz-title" className="sheet__title">
          Pop quiz
        </h1>
        <dl className="sheet__meta">
          <div>
            <dt>Name:</dt>
            <dd className="blank">{invitation.to}</dd>
          </div>
          <div>
            <dt>Date:</dt>
            <dd className="blank">{day ? formatDay(day) : weekdayName}</dd>
          </div>
          <div>
            <dt>Score:</dt>
            <dd>
              <span className="blank blank--score">{total}</span>/100
            </dd>
          </div>
        </dl>
      </header>

      <div className="sheet__body">
        <StickerSlot noCount={state.noCount} answered={state.answered}>
          {state.answered && <Grade instant={!live} />}
        </StickerSlot>
        <section className="question" aria-labelledby="question-1">
          <h2 id="question-1" className="question__text">
            <span className="question__num">1.</span>{" "}
            {question.map((part) =>
              part.marked ? <mark key={part.id}>{part.text}</mark> : <span key={part.id}>{part.text}</span>,
            )}
          </h2>
          {state.answered ? (
            <m.p
              className="cheer"
              initial={live ? { opacity: 0, scale: 0.4, rotate: -14 } : false}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ type: "spring", stiffness: 380, damping: 14, delay: live ? 0.25 : 0 }}
            >
              {invitation.yesTitle}
            </m.p>
          ) : (
            <p className={corrected ? "question__hint question__hint--pen" : "question__hint"}>
              {corrected ? invitation.correctionNote : "Fill in one bubble ✎"}
            </p>
          )}

          <div className="answers" role="group" aria-labelledby="question-1">
            <m.button
              type="button"
              className="answer answer--yes"
              style={scale(yesScale(state.noCount))}
              onClick={(event) => onYes(event.currentTarget.getBoundingClientRect())}
              whileTap={{ scale: 0.95 }}
            >
              <Bubble letter="A" filled={state.answered} instant={!live} />
              <span className="answer__label">Yes</span>
              {state.answered && (
                <>
                  <PenCircle delay={0.3} instant={!live} />
                  <PenCheck delay={0.85} instant={!live} />
                </>
              )}
            </m.button>

            <AnimatePresence initial={false}>
              {!state.answered && (
                <m.button
                  key="no"
                  type="button"
                  className="answer answer--no"
                  style={scale(corrected ? 1.15 : noScale(state.noCount))}
                  onClick={(event) => (corrected ? onYes(event.currentTarget.getBoundingClientRect()) : onNo())}
                  whileTap={{ scale: 0.95 }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                >
                  <Bubble letter="B" filled={false} instant />
                  <span className="answer__label">
                    {corrected ? (
                      <>
                        <del>{invitation.noReplies[0]}</del>
                        <PenStrike instant={!live} />
                        <ins>{invitation.correctedNo}</ins>
                        <span className="sr-only"> (corrected to yes)</span>
                      </>
                    ) : (
                      <AnimatePresence mode="popLayout" initial={false}>
                        <m.span
                          key={state.noCount}
                          className="answer__reply"
                          initial={{ opacity: 0, y: 10, rotate: -4 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                        >
                          {noLabel(state.noCount)}
                        </m.span>
                      </AnimatePresence>
                    )}
                  </span>
                </m.button>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <AnimatePresence initial={false}>
        {state.answered && (
          <m.section
            key="bonus"
            className="bonus"
            aria-labelledby="bonus-title"
            initial={live ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: live ? 1.2 : 0 }}
          >
            <h2 id="bonus-title" className="bonus__title">
              Bonus round <span>+10 each</span>
            </h2>
            <ChoiceGroup
              legend="2. When should we meet?"
              name="time"
              choices={invitation.times.map((choice) => ({ ...choice, hint: formatTime(choice.time) }))}
              value={time}
              onPick={(id) => prefs.set({ time: id })}
            />
            <ChoiceGroup
              legend="3. What snack should I bring?"
              name="snack"
              choices={invitation.snacks}
              value={snack}
              onPick={(id) => prefs.set({ snack: id })}
            />
          </m.section>
        )}
      </AnimatePresence>
    </m.article>
  );
}

function ChoiceGroup({
  legend,
  name,
  choices,
  value,
  onPick,
}: {
  legend: string;
  name: string;
  choices: Array<Choice & { hint?: string }>;
  value: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <fieldset className="choices">
      <legend>{legend}</legend>
      <div className="choices__list">
        {choices.map((choice) => (
          <label key={choice.id} className="chip">
            <input
              type="radio"
              name={name}
              value={choice.id}
              checked={value === choice.id}
              onChange={() => {
                sfx.tick();
                onPick(choice.id);
              }}
            />
            <span className="chip__face">
              <span aria-hidden="true">{choice.emoji}</span> {choice.label}
              {choice.hint && <span className="chip__hint">{choice.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
