"use client";

import { AnimatePresence, LazyMotion, MotionConfig, domMax, m, useAnimate, useReducedMotion } from "motion/react";
import { useReducer, useState } from "react";
import { invitation } from "@/content/invitation";
import { Icon } from "./art";
import { FoldedNote } from "./FoldedNote";
import { HallPass } from "./HallPass";
import { LAST_NO, initQuiz, isCorrected, noLabel, quizReducer } from "./logic";
import { prefs, usePrefs } from "./prefs";
import { Sheet } from "./Sheet";
import { buzz, sfx } from "./sound";

const HEART = "M12 21 C 5 16, 1 12, 2 8 C 3 4, 9 3, 12 7 C 15 3, 21 4, 22 8 C 23 12, 19 16, 12 21 Z";

async function celebrate(from: DOMRect) {
  try {
    const { default: confetti } = await import("canvas-confetti");
    const heart = confetti.shapeFromPath({ path: HEART });
    const base = {
      shapes: [heart, heart, "circle" as const, "star" as const],
      colors: ["#c8174a", "#ff7aa8", "#ffc2da", "#f6c343", "#8ec5ff"],
      disableForReducedMotion: true,
      zIndex: 60,
      ticks: 240,
    };
    const origin = {
      x: (from.left + from.width / 2) / window.innerWidth,
      y: (from.top + from.height / 2) / window.innerHeight,
    };
    void confetti({ ...base, origin, particleCount: 80, spread: 80, startVelocity: 38, scalar: 1.2 });
    void confetti({ ...base, origin: { x: 0, y: 0.8 }, angle: 60, particleCount: 45, spread: 55, startVelocity: 55 });
    void confetti({ ...base, origin: { x: 1, y: 0.8 }, angle: 120, particleCount: 45, spread: 55, startVelocity: 55 });
  } catch {
    // Confetti is a bonus; a failed chunk download must not break the answer.
  }
}

export function Quiz({ answered }: { answered: boolean }) {
  const [state, dispatch] = useReducer(quizReducer, answered, initQuiz);
  // Server-rendered answers appear finished; anything the visitor does from here on animates.
  const [live, setLive] = useState(false);
  const { muted } = usePrefs();
  const reduceMotion = useReducedMotion();
  const [sheet, animate] = useAnimate<HTMLElement>();

  function open() {
    setLive(true);
    sfx.unfold();
    buzz(8);
    dispatch({ type: "open" });
  }

  function no() {
    setLive(true);
    if (state.noCount === LAST_NO) sfx.scribble();
    else sfx.no();
    buzz(15);
    if (!reduceMotion && sheet.current) animate(sheet.current, { x: [0, -9, 8, -5, 3, 0] }, { duration: 0.42 });
    dispatch({ type: "no" });
  }

  function yes(from: DOMRect) {
    setLive(true);
    sfx.yes();
    buzz([20, 40, 30]);
    dispatch({ type: "yes" });
    // A real path for the answer lets page-view analytics count yeses without custom events.
    window.history.replaceState(null, "", "/yes");
    void celebrate(from);
  }

  function retake() {
    setLive(true);
    prefs.set({ time: null, snack: null });
    dispatch({ type: "retake" });
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const announcement = state.answered
    ? `${invitation.yesTitle} You said yes.`
    : isCorrected(state)
      ? `A red pen crossed out No and wrote ${invitation.correctedNo}`
      : state.noCount > 0
        ? `The No answer now says: ${noLabel(state.noCount)}`
        : "";

  return (
    // Features load with the page: a tap that beat a lazy chunk left exit animations, and the quiz, stuck.
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <button
          type="button"
          className="sound-toggle"
          aria-label="Sound effects"
          aria-pressed={!muted}
          onClick={() => prefs.set({ muted: !muted })}
        >
          <Icon name={muted ? "sound-off" : "sound-on"} />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {state.opened ? (
            <m.div key="quiz" className="stack">
              <Sheet ref={sheet} state={state} live={live} onNo={no} onYes={yes} />
              <AnimatePresence initial={false}>
                {state.answered && <HallPass key="pass" live={live} onRetake={retake} />}
              </AnimatePresence>
            </m.div>
          ) : (
            <FoldedNote key="note" onOpen={open} />
          )}
        </AnimatePresence>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </MotionConfig>
    </LazyMotion>
  );
}
