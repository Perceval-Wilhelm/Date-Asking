import type { StaticImageData } from "next/image";
import cat0 from "@/features/quiz/stickers/cat-0.jpg";
import cat1 from "@/features/quiz/stickers/cat-1.jpg";
import cat2 from "@/features/quiz/stickers/cat-2.jpg";
import cat3 from "@/features/quiz/stickers/cat-3.jpg";
import cat4 from "@/features/quiz/stickers/cat-4.jpg";
import cat5 from "@/features/quiz/stickers/cat-5.jpg";
import catYes from "@/features/quiz/stickers/cat-yes.jpg";

export type Sticker = { src: StaticImageData; alt: string };
export type Choice = { id: string; label: string; emoji: string };
export type TimeChoice = Choice & { time: string };

/** Everything the quiz says. Edit this file to send a different invitation. */
export const invitation = {
  from: "Thinh",
  /** Written on the quiz's name line. Leave empty to keep the line blank. */
  to: "",
  /** Words wrapped in *asterisks* get highlighted. */
  question: "Do you want to go on a *study date* this *Sunday* with me???",
  plan: "Study date",
  /** The plan's day of the week (0 = Sunday … 6 = Saturday). Keep it in step with the question. */
  weekday: 0,
  /** Pin an exact day as YYYY-MM-DD. Empty means the next upcoming `weekday`. */
  date: "",
  hours: 2,
  /** One sticker per "No" so far. The last one stays for any further "No". */
  stickers: [
    { src: cat0, alt: "A ginger kitten holding a bouquet of white lilies, looking up hopefully" },
    { src: cat1, alt: "A ginger kitten holding out a pink heart" },
    { src: cat2, alt: "A ginger cat with drawn-on tears under a row of hearts" },
    { src: cat3, alt: "A kitten lying on a bed with earbuds in, listening to sad music" },
    { src: cat4, alt: "A cat wailing with its mouth wide open and drawn-on tears" },
    { src: cat5, alt: "A crying cat giving a shaky thumbs-up" },
  ] satisfies Sticker[],
  yesSticker: {
    src: catYes,
    alt: "A black-and-white cat covering its face with its paws, surrounded by colourful hearts",
  } satisfies Sticker,
  /** The "No" button's label after each "No". After the last one, a red pen corrects it. */
  noReplies: [
    "No",
    "Are you sure?",
    "Pookie please",
    "Don't do this to me :(",
    "You're breaking my heart",
    "I'm gonna cry...",
  ],
  correctedNo: "Yes ♡",
  correctionNote: "fixed it for you ♡",
  yesTitle: "Yayyy!! :3",
  times: [
    { id: "morning", label: "Morning", emoji: "☀️", time: "09:00" },
    { id: "afternoon", label: "Afternoon", emoji: "🌤️", time: "14:00" },
    { id: "evening", label: "Evening", emoji: "🌙", time: "19:00" },
  ] satisfies TimeChoice[],
  snacks: [
    { id: "boba", label: "Bubble tea", emoji: "🧋" },
    { id: "cookies", label: "Cookies", emoji: "🍪" },
    { id: "banh-mi", label: "Bánh mì", emoji: "🥖" },
    { id: "surprise", label: "Surprise me", emoji: "✨" },
  ] satisfies Choice[],
};
