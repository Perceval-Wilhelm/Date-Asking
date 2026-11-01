import { Quiz } from "@/features/quiz/Quiz";

export default function Home() {
  return (
    <>
      <Quiz answered={false} />
      <noscript>
        <p className="noscript">This pop quiz passes notes with JavaScript. Please turn it on ✎</p>
      </noscript>
    </>
  );
}
