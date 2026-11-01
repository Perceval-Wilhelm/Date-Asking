import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

// Finish every Motion animation immediately so tests assert end states.
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

window.scrollTo = vi.fn();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
