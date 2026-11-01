import { useSyncExternalStore } from "react";
import { invitation } from "@/content/invitation";

export type Prefs = { muted: boolean; time: string | null; snack: string | null };

const KEY = "date-asking:v1";
const DEFAULTS: Prefs = { muted: false, time: null, snack: null };
const listeners = new Set<() => void>();
let current: Prefs | undefined;

const knownId = (value: unknown, choices: ReadonlyArray<{ id: string }>) =>
  typeof value === "string" && choices.some((choice) => choice.id === value) ? value : null;

/** Stored values come from the visitor's browser, so accept only shapes this version understands. */
export function sanitizePrefs(value: unknown): Prefs {
  if (typeof value !== "object" || value === null) return DEFAULTS;
  const saved = value as Record<string, unknown>;
  return {
    muted: saved.muted === true,
    time: knownId(saved.time, invitation.times),
    snack: knownId(saved.snack, invitation.snacks),
  };
}

function load(): Prefs {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitizePrefs(JSON.parse(raw)) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export const prefs = {
  get: () => (current ??= load()),
  set(patch: Partial<Prefs>) {
    current = { ...prefs.get(), ...patch };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      // Private browsing or blocked storage: keep the in-memory value for this visit.
    }
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function usePrefs() {
  return useSyncExternalStore(prefs.subscribe, prefs.get, () => DEFAULTS);
}
