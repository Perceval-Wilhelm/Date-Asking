"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

/** Draws a path like a pen stroke. `instant` renders it finished, e.g. on a server-rendered /yes. */
function ink(delay: number, duration: number, instant: boolean) {
  return {
    initial: instant ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { delay, duration, ease: "easeInOut" as const },
      opacity: { delay, duration: 0.01 },
    },
  };
}

type Mark = { delay?: number; instant: boolean };

export function Bubble({ letter, filled, instant }: { letter: string; filled: boolean; instant: boolean }) {
  return (
    <svg className="bubble" viewBox="0 0 56 40" aria-hidden="true">
      <ellipse className="bubble__ring" cx="28" cy="20" rx="24" ry="16" />
      <text className="bubble__letter" x="28" y="21" textAnchor="middle" dominantBaseline="central">
        {letter}
      </text>
      {filled && (
        <m.path
          className="bubble__fill"
          d="M11 10 L45 9 L7 15 L49 14 L5 20 L51 20 L7 26 L49 25 L12 30 L44 31"
          {...ink(0, 0.45, instant)}
        />
      )}
    </svg>
  );
}

export function PenCircle({ delay = 0, instant }: Mark) {
  return (
    <svg className="pen pen--circle" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
      <m.path
        d="M30 16 C 82 2, 172 4, 192 32 C 206 56, 152 77, 96 75 C 40 73, 4 60, 9 38 C 13 21, 44 10, 78 9"
        {...ink(delay, 0.6, instant)}
      />
    </svg>
  );
}

export function PenCheck({ delay = 0, instant }: Mark) {
  return (
    <svg className="pen pen--check" viewBox="0 0 48 40" aria-hidden="true">
      <m.path d="M5 22 L18 34 L43 5" {...ink(delay, 0.35, instant)} />
    </svg>
  );
}

export function PenStrike({ instant }: Mark) {
  return (
    <svg className="pen pen--strike" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
      <m.path d="M2 12 C 20 5, 35 16, 52 9 S 82 5, 98 11" {...ink(0, 0.3, instant)} />
      <m.path d="M4 15 C 30 11, 60 15, 96 8" {...ink(0.22, 0.25, instant)} />
    </svg>
  );
}

export function Grade({ instant }: Mark) {
  return (
    <svg className="grade" viewBox="0 0 120 96" aria-hidden="true">
      <m.path d="M18 80 L40 18 L62 80" {...ink(0.5, 0.4, instant)} />
      <m.path d="M28 58 L54 56" {...ink(0.85, 0.15, instant)} />
      <m.path d="M74 48 L104 46" {...ink(1, 0.15, instant)} />
      <m.path d="M88 32 L90 62" {...ink(1.12, 0.15, instant)} />
      <m.path
        d="M64 8 C 104 6, 118 34, 114 56 C 108 84, 66 94, 38 88 C 10 82, 2 58, 8 38 C 14 18, 40 6, 72 10"
        {...ink(1.3, 0.5, instant)}
      />
    </svg>
  );
}

export type DoodleKind = "question" | "tears" | "cloud" | "broken" | "heart" | "star" | "sparkle";

const HEART = "M24 40 C 12 32, 4 24, 6 15 C 8 8, 18 6, 24 14 C 30 6, 40 8, 42 15 C 44 24, 36 32, 24 40 Z";

const doodles: Record<DoodleKind, ReactNode> = {
  question: (
    <>
      <path d="M16 16 C 16 7, 33 7, 32 16 C 31.5 22, 24 22, 24 30" />
      <circle cx="24" cy="38" r="1.6" className="doodle__dot" />
    </>
  ),
  tears: (
    <>
      <path d="M14 8 C 14 8, 7 19, 7 24 A 7 7 0 0 0 21 24 C 21 19, 14 8, 14 8 Z" />
      <path d="M34 20 C 34 20, 29 28, 29 31 A 5 5 0 0 0 39 31 C 39 28, 34 20, 34 20 Z" />
    </>
  ),
  cloud: (
    <>
      <path d="M12 28 H35 A7 7 0 0 0 35 14 A10 10 0 0 0 16 12 A8 8 0 0 0 12 28 Z" />
      <path className="doodle__rain" d="M16 34 L14 40" />
      <path className="doodle__rain" d="M24 34 L22 40" />
      <path className="doodle__rain" d="M32 34 L30 40" />
    </>
  ),
  broken: (
    <>
      <path d={HEART} />
      <path d="M24 14 L20 22 L27 26 L22 35" />
    </>
  ),
  heart: <path d={HEART} />,
  star: <path d="M24 5 L29.5 17.5 L43 18.5 L32.5 27.5 L36 41 L24 33.5 L12 41 L15.5 27.5 L5 18.5 L18.5 17.5 Z" />,
  sparkle: <path d="M24 6 C 25 19, 29 23, 42 24 C 29 25, 25 29, 24 42 C 23 29, 19 25, 6 24 C 19 23, 23 19, 24 6 Z" />,
};

export function Doodle({ kind, className, tilt }: { kind: DoodleKind; className: string; tilt: number }) {
  return (
    <m.svg
      className={`doodle doodle--${kind} ${className}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0, rotate: tilt - 30 }}
      animate={{ opacity: 1, scale: 1, rotate: tilt }}
      exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 16 }}
    >
      {doodles[kind]}
    </m.svg>
  );
}

export type IconName = "sound-on" | "sound-off" | "calendar" | "send" | "retake" | "external";

const icons: Record<IconName, ReactNode> = {
  "sound-on": (
    <>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" />
      <path d="M16.5 8.5 A5 5 0 0 1 16.5 15.5" />
      <path d="M19 6 A8.5 8.5 0 0 1 19 18" />
    </>
  ),
  "sound-off": (
    <>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" />
      <path d="M17 9.5 L22 14.5 M22 9.5 L17 14.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10 H20 M8.5 3 V7.5 M15.5 3 V7.5" />
      <path d="M12 18 C 9.5 16.4, 8.6 15.2, 9 14.1 C 9.4 13, 11 12.9, 12 14 C 13 12.9, 14.6 13, 15 14.1 C 15.4 15.2, 14.5 16.4, 12 18 Z" />
    </>
  ),
  send: <path d="M3.5 11 L20.5 3.5 L14 20.5 L11 13 Z M11 13 L20.5 3.5" />,
  retake: (
    <>
      <path d="M4.5 12 A7.5 7.5 0 1 0 7 6.4" />
      <path d="M3.5 3.5 V8 H8" />
    </>
  ),
  external: <path d="M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10" />,
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}
