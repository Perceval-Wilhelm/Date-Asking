import { invitation } from "@/content/invitation";

export type QuizState = { opened: boolean; noCount: number; answered: boolean };
export type QuizAction = { type: "open" | "no" | "yes" | "retake" };

/** Index of the last pleading label. One more "No" after it gets corrected to "Yes". */
export const LAST_NO = invitation.noReplies.length - 1;

export function initQuiz(answered: boolean): QuizState {
  return { opened: answered, noCount: 0, answered };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "open":
      return state.opened ? state : { ...state, opened: true };
    case "no":
      return state.answered || isCorrected(state) ? state : { ...state, noCount: state.noCount + 1 };
    case "yes":
      return { ...state, opened: true, answered: true };
    case "retake":
      return { opened: true, noCount: 0, answered: false };
  }
}

export const isCorrected = (state: QuizState) => state.noCount > LAST_NO;
export const noLabel = (noCount: number) => invitation.noReplies[Math.min(noCount, LAST_NO)];
export const stickerIndex = (noCount: number) => Math.min(noCount, invitation.stickers.length - 1);
/** Yes swells and No shrinks with every "No", like the original 1.6× font growth but bounded for phones. */
export const yesScale = (noCount: number) => 1.21 ** Math.min(noCount, LAST_NO);
export const noScale = (noCount: number) => 0.94 ** Math.min(noCount, LAST_NO);

export type QuestionPart = { id: string; text: string; marked: boolean };

/** Splits "a *marked* phrase" into plain and highlighted runs. */
export function parseQuestion(question: string): QuestionPart[] {
  return question
    .split(/\*([^*]+)\*/)
    .map((text, index) => ({ id: `part-${index}`, text, marked: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}

export function score(answered: boolean, bonusAnswers: number) {
  return answered ? 100 + 10 * bonusAnswers : null;
}
