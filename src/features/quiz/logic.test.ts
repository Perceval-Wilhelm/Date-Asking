import { describe, expect, it } from "vitest";
import { invitation } from "@/content/invitation";
import {
  LAST_NO,
  initQuiz,
  isCorrected,
  noLabel,
  noScale,
  parseQuestion,
  quizReducer,
  score,
  stickerIndex,
  yesScale,
  type QuizState,
} from "./logic";

const press = (state: QuizState, ...types: Array<"open" | "no" | "yes" | "retake">) =>
  types.reduce((current, type) => quizReducer(current, { type }), state);

describe("quiz state", () => {
  it("starts folded, or already answered on /yes", () => {
    expect(initQuiz(false)).toEqual({ opened: false, noCount: 0, answered: false });
    expect(initQuiz(true)).toEqual({ opened: true, noCount: 0, answered: true });
  });

  it("walks every pleading label, then lets the red pen correct the answer", () => {
    let state = press(initQuiz(false), "open");
    const labels = [noLabel(state.noCount)];
    for (let i = 0; i < LAST_NO; i++) {
      state = press(state, "no");
      labels.push(noLabel(state.noCount));
    }
    expect(labels).toEqual(invitation.noReplies);
    expect(isCorrected(state)).toBe(false);

    state = press(state, "no");
    expect(isCorrected(state)).toBe(true);
    expect(press(state, "no")).toBe(state);
  });

  it("ignores further No answers once the answer is Yes", () => {
    const answered = press(initQuiz(false), "open", "no", "yes");
    expect(answered.answered).toBe(true);
    expect(press(answered, "no")).toBe(answered);
  });

  it("retakes from a fresh, opened sheet", () => {
    expect(press(initQuiz(true), "retake")).toEqual({ opened: true, noCount: 0, answered: false });
  });

  it("keeps the last sticker and growth once the pleading runs out", () => {
    expect(stickerIndex(0)).toBe(0);
    expect(stickerIndex(99)).toBe(invitation.stickers.length - 1);
    expect(yesScale(LAST_NO + 1)).toBe(yesScale(LAST_NO));
    expect(yesScale(1)).toBeGreaterThan(yesScale(0));
    expect(noScale(1)).toBeLessThan(noScale(0));
  });

  it("scores 100, plus 10 for each bonus answer", () => {
    expect(score(false, 2)).toBeNull();
    expect(score(true, 0)).toBe(100);
    expect(score(true, 2)).toBe(120);
  });
});

describe("question highlighting", () => {
  it("splits *marked* phrases into highlighted runs", () => {
    expect(parseQuestion("A *study date* this *Sunday*?").map(({ text, marked }) => [text, marked])).toEqual([
      ["A ", false],
      ["study date", true],
      [" this ", false],
      ["Sunday", true],
      ["?", false],
    ]);
  });

  it("gives every run a distinct key", () => {
    const ids = parseQuestion(invitation.question).map((part) => part.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves unmarked text and stray asterisks alone", () => {
    expect(parseQuestion("Hi * there")).toEqual([{ id: "part-0", text: "Hi * there", marked: false }]);
  });
});
