import { describe, expect, it, vi } from "vitest";
import { invitation } from "@/content/invitation";
import { answerMessage, shareText } from "./share";

describe("answer message", () => {
  it("includes the picked time and snack", () => {
    expect(
      answerMessage({
        plan: "Study date",
        day: "Sun, Nov 8",
        time: "2:00 PM",
        snack: invitation.snacks[0],
        from: "Thinh",
      }),
    ).toBe("I said YES ♡ Study date on Sun, Nov 8 at 2:00 PM. Snack order: bubble tea 🧋. See you, Thinh!");
  });

  it("reads naturally before the bonus questions are answered", () => {
    expect(answerMessage({ plan: "Study date", day: "Sunday", time: null, snack: null, from: "Thinh" })).toBe(
      "I said YES ♡ Study date on Sunday. See you, Thinh!",
    );
  });
});

describe("sharing", () => {
  const stubNavigator = (value: Partial<Navigator>) => vi.stubGlobal("navigator", { ...navigator, ...value });

  it("uses the share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share });
    await expect(shareText("hi")).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: "hi" });
  });

  it("treats a dismissed share sheet as a choice, not a failure", async () => {
    stubNavigator({ share: vi.fn().mockRejectedValue(new DOMException("closed", "AbortError")) });
    await expect(shareText("hi")).resolves.toBe("cancelled");
  });

  it("falls back to copying, then reports when neither works", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share: undefined, clipboard: { writeText } as unknown as Clipboard });
    await expect(shareText("hi")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("hi");

    stubNavigator({
      share: vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError")),
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } as unknown as Clipboard,
    });
    await expect(shareText("hi")).resolves.toBe("failed");
  });
});
