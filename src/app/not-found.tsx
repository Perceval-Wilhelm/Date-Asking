import Link from "next/link";

export default function NotFound() {
  return (
    <article className="sheet sheet--small">
      <span className="sheet__margin" aria-hidden="true" />
      <h1 className="sheet__title">404</h1>
      <p className="question__text">This page skipped class.</p>
      <Link className="btn" href="/">
        Back to the quiz
      </Link>
    </article>
  );
}
