"use client";

import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";
import { invitation, type Sticker as StickerData } from "@/content/invitation";
import { Doodle, type DoodleKind } from "./art";
import { stickerIndex } from "./logic";

const SIZES = "(min-width: 46rem) 248px, 138px";
const TILTS = [-4, 3, -6, 5, -3, 6];

const sadDoodles: Array<{ from: number; kind: DoodleKind; className: string; tilt: number }> = [
  { from: 1, kind: "question", className: "doodle--tl", tilt: -12 },
  { from: 2, kind: "tears", className: "doodle--bl", tilt: 8 },
  { from: 3, kind: "cloud", className: "doodle--tr", tilt: 4 },
  { from: 4, kind: "broken", className: "doodle--r", tilt: 10 },
];
const happyDoodles: Array<{ kind: DoodleKind; className: string; tilt: number }> = [
  { kind: "heart", className: "doodle--tl", tilt: -14 },
  { kind: "star", className: "doodle--tr", tilt: 12 },
  { kind: "heart", className: "doodle--r", tilt: 16 },
  { kind: "sparkle", className: "doodle--br", tilt: 0 },
];

/** Hidden copies make the browser fetch upcoming stickers early, so a swap never flashes empty. */
export function WarmStickers({ stickers }: { stickers: StickerData[] }) {
  return (
    <div className="warm" aria-hidden="true">
      {stickers.map((sticker) => (
        <Image key={sticker.src.src} src={sticker.src} alt="" sizes={SIZES} loading="eager" fetchPriority="low" />
      ))}
    </div>
  );
}

const finePointer = (onChange: () => void) => {
  const query = window.matchMedia("(pointer: fine)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export function StickerSlot({
  noCount,
  answered,
  children,
}: {
  noCount: number;
  answered: boolean;
  children?: ReactNode;
}) {
  const index = stickerIndex(noCount);
  const sticker = answered ? invitation.yesSticker : invitation.stickers[index];
  const tilt = answered ? 2 : TILTS[index % TILTS.length];
  // Dragging on touch screens would steal the page scroll, so only mouse and pen users get to play with it.
  const canDrag = useSyncExternalStore(
    finePointer,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );

  const upcoming = invitation.stickers.slice(index + 1, index + 2);

  return (
    <div className="sticker-slot">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.figure
          key={answered ? "yes" : index}
          className="sticker"
          data-draggable={canDrag || undefined}
          initial={{ opacity: 0, scale: 1.45, rotate: tilt - 14 }}
          animate={{ opacity: 1, scale: 1, rotate: tilt }}
          exit={{
            opacity: 0,
            x: -50,
            y: -120,
            scale: 0.85,
            rotate: tilt - 28,
            transition: { duration: 0.32, ease: "easeIn" },
          }}
          transition={{ type: "spring", stiffness: 520, damping: 24 }}
          drag={canDrag}
          dragSnapToOrigin
          dragElastic={0.4}
          whileDrag={{ scale: 1.06, rotate: tilt + 5 }}
        >
          <Image
            src={sticker.src}
            alt={sticker.alt}
            sizes={SIZES}
            loading="eager"
            placeholder="blur"
            preload={answered}
            draggable={false}
          />
          <span className="tape" aria-hidden="true" />
        </m.figure>
      </AnimatePresence>
      <AnimatePresence>
        {answered
          ? happyDoodles.map((doodle) => <Doodle key={`happy-${doodle.className}`} {...doodle} />)
          : sadDoodles
              .filter((doodle) => noCount >= doodle.from)
              .map((doodle) => <Doodle key={`sad-${doodle.className}`} {...doodle} />)}
      </AnimatePresence>
      {children}
      {!answered && <WarmStickers stickers={[...upcoming, invitation.yesSticker]} />}
    </div>
  );
}
