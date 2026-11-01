import type { Choice } from "@/content/invitation";

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export function answerMessage({
  plan,
  day,
  time,
  snack,
  from,
}: {
  plan: string;
  day: string;
  time: string | null;
  snack: Choice | null;
  from: string;
}) {
  const when = time ? `${day} at ${time}` : day;
  const order = snack ? ` Snack order: ${snack.label.toLowerCase()} ${snack.emoji}.` : "";
  return `I said YES ♡ ${plan} on ${when}.${order} See you, ${from}!`;
}

/** Opens the share sheet where there is one, otherwise copies the text. */
export async function shareText(text: string): Promise<ShareResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}

export function downloadFile(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // Safari starts the download asynchronously; revoking at once can cancel it.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
