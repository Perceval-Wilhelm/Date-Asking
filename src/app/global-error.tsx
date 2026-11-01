"use client";

// Replaces the root layout when it fails, so it brings its own document and styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh" }}>
        <main style={{ textAlign: "center", padding: 16 }}>
          <h1>The note got lost on the way.</h1>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 18px", fontSize: 16 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
