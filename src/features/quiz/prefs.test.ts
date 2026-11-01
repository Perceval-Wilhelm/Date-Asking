import { describe, expect, it } from "vitest";
import { sanitizePrefs } from "./prefs";

describe("stored preferences", () => {
  it("keeps values this version understands", () => {
    expect(sanitizePrefs({ muted: true, time: "evening", snack: "boba" })).toEqual({
      muted: true,
      time: "evening",
      snack: "boba",
    });
  });

  it.each([null, "yes", 42, []])("falls back to defaults for %j", (value) => {
    expect(sanitizePrefs(value)).toEqual({ muted: false, time: null, snack: null });
  });

  it("drops unknown or tampered choices", () => {
    expect(sanitizePrefs({ muted: "true", time: "midnight", snack: { id: "boba" } })).toEqual({
      muted: false,
      time: null,
      snack: null,
    });
  });
});
