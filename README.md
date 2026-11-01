# Date-Asking

A pop quiz, passed like a note in class, that asks someone on a study date.

The visitor taps a folded note to open it. Inside is a notebook-page quiz with one question and two answer bubbles. Every "No" swaps in a sadder cat sticker, adds a doodle, grows the "Yes" and shrinks the "No", while the button pleads ("Are you sure?", "Pookie please", …). After the last plea, a red pen crosses out "No" and writes "Yes ♡". Answering yes fills the bubble, grades the quiz A+, throws confetti and opens a bonus round (time and snack) that fills in a hall pass. From the pass, the visitor can add the date to their calendar or send the answer back.

## Make it yours

Everything the quiz says lives in [`src/content/invitation.ts`](src/content/invitation.ts):

| Field                      | What it changes                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `from`, `to`               | Who sent the note, and the name written on the quiz (empty leaves the line blank).                                                     |
| `question`                 | The question. Words wrapped in `*asterisks*` get the pink highlighter.                                                                 |
| `plan`, `weekday`, `date`  | What the date is and when. With `date` empty, the hall pass uses the visitor's next upcoming `weekday`; set `YYYY-MM-DD` to pin a day. |
| `stickers`, `yesSticker`   | One photo per "No" (the last repeats) and the photo for "Yes". Each needs alt text.                                                    |
| `noReplies`, `correctedNo` | What the "No" button says after each press, and what the red pen writes over it.                                                       |
| `times`, `snacks`, `hours` | The bonus-round choices and how long the calendar event lasts.                                                                         |

The share image, page title and link preview text follow these values automatically.

## Develop

Use Node.js **26.13.0** (see `.nvmrc`) and the Yarn version pinned in `package.json`, through Corepack. Node 25 and newer no longer bundle Corepack, so install it once:

```sh
npm install --global corepack@0.36.0
corepack yarn install --immutable
corepack yarn dev
```

| Command                   | Runs                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `corepack yarn check:all` | Formatting, zero-warning ESLint, route types, TypeScript, unit tests, lint-rule regression tests and a production build. |
| `corepack yarn test:e2e`  | Playwright against the production build at phone, tablet and desktop sizes. Run `build` first.                           |
| `corepack yarn verify`    | Both of the above.                                                                                                       |
| `corepack yarn format`    | Rewrites formatting with Prettier.                                                                                       |

Install the test browser once with `corepack yarn exec playwright install chromium`. The browser tests serve on port 4321; set `PLAYWRIGHT_PORT` if it is taken.

The browser suite walks the whole journey, downloads the calendar file, checks the share fallback, scans every state with axe for accessibility violations, keeps the question and answers above the fold on a 375 × 667 phone, rejects sideways scrolling, checks the security headers, keeps the share image under 300 KB (WhatsApp's preview limit) and caps the first-load JavaScript.

## Stack

Next.js 16 (App Router, every route prerendered as static), React 19, TypeScript, Motion for springs and pen strokes, and canvas-confetti, loaded only when someone says yes. Styling is plain CSS. Sounds are synthesised with the Web Audio API, so the site ships no audio files. Fonts are Shantell Sans and Protest Riot, self-hosted through Fontsource.

The page respects reduced motion, works with a keyboard and screen reader (live announcements for each "No"), supports dark mode on the desk around the paper, and explains itself when JavaScript is off.

## Delivery

GitHub [Perceval-Wilhelm/Date-Asking](https://github.com/Perceval-Wilhelm/Date-Asking) deploys to the Vercel project [date-asking](https://vercel.com/perceval-wilhelms-projects/date-asking) in the personal `perceval-wilhelms-projects` workspace through Vercel's Git integration. No deploy tokens are stored in GitHub.

- **Pull requests** run two GitHub Actions jobs from [`.github/workflows/check.yml`](.github/workflows/check.yml): **Date-Asking quality** (immutable install, high-severity dependency audit, `check:all`) and **Date-Asking browser** (the Playwright suite). Vercel builds a preview for every branch, behind Vercel Authentication.
- **`main`** is protected by a ruleset: changes arrive through pull requests with resolved conversations and both checks passing on an up-to-date branch, history stays linear, merges are squash-only, and force pushes and deletion are blocked. Merged branches are deleted automatically.
- **Production** builds from `main`. Both checks are registered as Vercel deployment checks, so a production build is only assigned the live domain after they pass.
- **Maintenance**: Dependabot proposes grouped weekly updates for npm and GitHub Actions (no auto-merge). Dependabot alerts and security updates, secret scanning with push protection, and CodeQL code scanning are on. Actions must be pinned to full commit SHAs, and the workflow token is read-only.
- **Recovery**: use Vercel's Instant Rollback to a previous production deployment, then fix forward with a pull request.

`vercel.json` installs and builds through a pinned `corepack@0.36.0` so Vercel never falls back to Yarn 1. Update that pin in `vercel.json`, the workflow and this README together.

## Observability

Production builds (and only production builds) mount Vercel Web Analytics and Speed Insights on the free Hobby tier. Both share one privacy filter ([`src/lib/monitoring.ts`](src/lib/monitoring.ts)): query strings, fragments and credentials are stripped from URLs, and custom events are dropped. Neither tool sets cookies.

Answering yes moves the address to `/yes` without reloading. Web Analytics counts that as a page view, so the dashboard's **Pages** list shows how many visitors said yes, with no custom events needed. Speed Insights reports real-visitor Core Web Vitals.

Every response carries a Content Security Policy (no third-party scripts, no framing, no plugins) plus `nosniff`, a strict referrer policy and a locked-down permissions policy. On preview deployments the policy also allows Vercel's toolbar.

## Credits

The cat photos are well-known internet memes kept from the original version of this site; they belong to their creators. Shantell Sans and Protest Riot are licensed under the SIL Open Font License 1.1.
