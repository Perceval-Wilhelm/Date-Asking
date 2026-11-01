"use client";

import { m, useAnimate, useReducedMotion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/content/invitation";
import { WarmStickers } from "./Sticker";

export function FoldedNote({ onOpen }: { onOpen: () => void }) {
  const [scope, animate] = useAnimate<HTMLButtonElement>();
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);

  async function open() {
    if (opening) return;
    setOpening(true);
    if (!reduceMotion) {
      // Browsers pause animation frames in background tabs; never let that strand the visitor here.
      await Promise.race([
        animate([
          [".note__seal", { scale: [1, 1.3, 0], rotate: [0, -12, 30] }, { duration: 0.34 }],
          [".note__flap", { rotateX: 180 }, { duration: 0.5, ease: [0.3, 0.7, 0.4, 1], at: "-0.08" }],
        ]),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    }
    onOpen();
  }

  return (
    <m.div className="note-wrap" exit={{ opacity: 0, scale: 1.1, y: -12, transition: { duration: 0.26 } }}>
      <h1 className="sr-only">A note from {invitation.from}</h1>
      <div className="note-float">
        {/* The spoken name keeps the visible words, so voice control users can say what they see. */}
        <button ref={scope} type="button" className="note" onClick={open}>
          <span className="sr-only">Open the note: </span>
          <span className="note__body">
            <span className="note__to">{invitation.to ? `for ${invitation.to} ♡` : "for you ♡"}</span>
            <span className="note__from">from {invitation.from}</span>
          </span>
          <span className="note__flap" />
          <span className="note__seal" aria-hidden="true">
            ♡
          </span>
        </button>
      </div>
      <p className="note__hint" aria-hidden="true">
        tap to open ✎
      </p>
      {/* The first cat downloads while the note is still folded. */}
      <WarmStickers stickers={[invitation.stickers[0]]} />
    </m.div>
  );
}
