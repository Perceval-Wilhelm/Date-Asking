# date-asking contributor guide

A single-page pop quiz that asks someone on a study date. Read `README.md` first; it covers the experience, commands, delivery and observability.

## Architecture

- `src/content/invitation.ts` holds every word, photo and choice. Keep copy there, not in components.
- `src/features/quiz/Quiz.tsx` is the only stateful client component. It owns the reducer from `logic.ts`, sounds, confetti and the `/yes` address change. `FoldedNote`, `Sheet`, `Sticker` and `HallPass` render that state.
- Pure logic lives in `logic.ts`, `calendar.ts`, `share.ts` and `dates.ts`, with unit tests beside them. `prefs.ts` is the only `localStorage` access; validate anything read back from it.
- `art.tsx` draws pen marks, doodles and icons as inline SVG. Motion animates them; pass `instant` when a state is server-rendered so nothing replays on load.
- `/` and `/yes` render the same `Quiz`. `/yes` exists so page-view analytics can count answers; keep it static.
- Styles are plain CSS in `src/app/globals.css`, organised by section. Put new animation inside `prefers-reduced-motion: no-preference`.

## Rules

- Phones first: on a 375 × 667 screen, the question and both answers stay above the fold and nothing scrolls sideways. The browser tests enforce this.
- Every interactive element is a real button, link or input with a name that contains its visible text. Run the axe scan in `e2e/` after UI changes.
- No backend, accounts, custom analytics events or third-party scripts without a new product requirement. Keep the monitoring privacy filter and production-only mounting.
- Pin direct dependency versions and commit `yarn.lock`. Prefer the newest stable versions that work together; do not force peers or add broad resolutions. TypeScript stays on 6.x until `typescript-eslint` supports 7.
- Keep GitHub Action references pinned to full commit SHAs and keep the job names **Date-Asking quality** and **Date-Asking browser**: the branch ruleset and Vercel deployment checks require them by name, so rename all three together or not at all.
- The code is MIT licensed; the cat photos and fonts are not ours to license. Keep the README's License section accurate when assets change.
- Use Conventional Commits. Commit and push only when asked.

`next.config.ts` sets `agentRules: false` so Next.js does not append generated instructions to this file.
