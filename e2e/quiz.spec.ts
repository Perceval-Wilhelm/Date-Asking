import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const NO_REPLIES = [
  "No",
  "Are you sure?",
  "Pookie please",
  "Don't do this to me :(",
  "You're breaking my heart",
  "I'm gonna cry...",
];

/** Fails the test on console errors, page errors and failed requests. */
function watchForProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`http ${response.status()}: ${response.url()}`);
  });
  return problems;
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function expectInViewport(page: Page, name: string | RegExp) {
  const box = await page.getByRole("button", { name, exact: true }).boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  expect(box, `${name} is rendered`).not.toBeNull();
  expect(box!.y + box!.height, `${name} is above the fold`).toBeLessThanOrEqual(height);
}

// The folded note floats forever, so it never passes Playwright's "stable" check; skip just that check.
const clickNote = (page: Page) => page.getByRole("button", { name: /^Open the note/ }).click({ force: true });

async function openNote(page: Page) {
  await page.goto("/");
  await clickNote(page);
  await expect(page.getByRole("heading", { name: "Pop quiz", level: 1 })).toBeVisible();
}

test("asks, pleads through every No and celebrates the corrected Yes", async ({ page }) => {
  const problems = watchForProblems(page);
  await openNote(page);
  await expectInViewport(page, "Yes");
  await expectInViewport(page, "No");

  for (const label of NO_REPLIES) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expectNoHorizontalScroll(page);
  }
  await expect(page.getByText("fixed it for you ♡")).toBeVisible();
  await expectInViewport(page, /corrected to yes/);

  await page.getByRole("button", { name: /corrected to yes/ }).click();
  await expect(page.getByText("Yayyy!! :3", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/yes$/);
  await expect(page.getByRole("img", { name: /covering its face with its paws/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Hall pass" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  expect(problems).toEqual([]);
});

test("turns the bonus round into a calendar file and a message", async ({ page }) => {
  const problems = watchForProblems(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (text: string) => void ((window as unknown as { copied: string }).copied = text) },
    });
  });
  await openNote(page);
  await page.getByRole("button", { name: "Yes", exact: true }).click();

  await page.getByRole("radio", { name: /Evening/ }).check();
  await page.getByRole("radio", { name: /Bánh mì/ }).check();
  const pass = page.getByRole("region", { name: "Hall pass" });
  await expect(pass).toContainText("7:00 PM");
  await expect(pass).toContainText("Bánh mì 🥖");
  await expect(page.getByText("120", { exact: true })).toBeVisible();

  const download = page.waitForEvent("download");
  await pass.getByRole("button", { name: "Add to calendar" }).click();
  const ics = await readFile((await (await download).path())!, "utf8");
  expect(download).toBeTruthy();
  expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
  expect(ics).toMatch(/DTSTART:\d{8}T190000\r\n/);
  expect(ics).toContain("SUMMARY:Study date with Thinh ♡");

  await expect(pass.getByRole("link", { name: /Google Calendar/ })).toHaveAttribute("href", /dates=\d{8}T190000/);

  await pass.getByRole("button", { name: "Tell Thinh" }).click();
  await expect(pass.getByRole("status")).toContainText("Copied!");
  const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied).toMatch(/^I said YES ♡ Study date on .+ at 7:00 PM\. Snack order: bánh mì 🥖\. See you, Thinh!$/);
  expect(problems).toEqual([]);
});

test("opens /yes already answered, keeps bonus picks and retakes", async ({ page }) => {
  await page.goto("/yes");
  await expect(page.getByText("Yayyy!! :3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open the note/ })).toHaveCount(0);
  await page.getByRole("radio", { name: /Morning/ }).check();

  await page.reload();
  await expect(page.getByRole("radio", { name: /Morning/ })).toBeChecked();

  await page.getByRole("button", { name: "Retake the quiz" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "No", exact: true })).toBeVisible();
  await expect(page.getByText("Yayyy!! :3", { exact: true })).toHaveCount(0);
});

test("has no detectable accessibility violations", async ({ page }) => {
  const scan = async (state: string) => {
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((violation) => `${state}: ${violation.id} ${violation.nodes[0]?.target}`)).toEqual([]);
  };
  await page.goto("/");
  await scan("folded note");
  await clickNote(page);
  await expect(page.getByRole("heading", { name: "Pop quiz" })).toBeVisible();
  await scan("quiz");
  for (const label of NO_REPLIES) await page.getByRole("button", { name: label, exact: true }).click();
  await scan("corrected");
  await page.goto("/yes");
  await scan("answered");
});

test("respects reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await openNote(page);
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(page.getByText("Yayyy!! :3", { exact: true })).toBeVisible();
  // canvas-confetti skips its canvas entirely when motion is reduced.
  await expect(page.locator("canvas")).toHaveCount(0);
  await context.close();
});

test("explains itself without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  // Playwright's text search skips <noscript>, so locate the message by its class.
  await expect(page.locator(".noscript")).toHaveText(/passes notes with JavaScript/);
  await expect(page.locator(".noscript")).toBeVisible();
  await context.close();
});

test("sends security headers and a social preview", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");

  const html = await response.text();
  const image = /<meta property="og:image" content="[^"]*?(\/opengraph-image[^"]*)"/.exec(html)?.[1];
  expect(image).toBeTruthy();
  const preview = await request.get(image!);
  expect(preview.headers()["content-type"]).toBe("image/png");
  // WhatsApp drops link previews whose image is larger than about 300 KB.
  expect((await preview.body()).length).toBeLessThan(300_000);
});

test("keeps the first load light", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop-chromium", "One measurement is enough.");
  let scriptBytes = 0;
  page.on("requestfinished", async (request) => {
    if (request.resourceType() === "script") scriptBytes += (await request.sizes()).responseBodySize;
  });
  await page.goto("/", { waitUntil: "networkidle" });
  // Compressed JavaScript before the note is opened; Motion's features load lazily.
  expect(scriptBytes).toBeGreaterThan(0);
  expect(scriptBytes).toBeLessThan(260_000);
});
