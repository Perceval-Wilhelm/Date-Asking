import type { Metadata } from "next";
import { invitation } from "@/content/invitation";
import { Quiz } from "@/features/quiz/Quiz";

export const metadata: Metadata = {
  title: `${invitation.yesTitle} It's a date ✏️`,
  robots: { index: false },
};

export default function Answered() {
  return <Quiz answered />;
}
