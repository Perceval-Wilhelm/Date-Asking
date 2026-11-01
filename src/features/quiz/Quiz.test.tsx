import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { invitation } from "@/content/invitation";
import { Quiz } from "./Quiz";

// Vite imports images as plain URLs, without the sizes next/image needs, and jsdom has no canvas.
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (alt ? <span role="img" aria-label={alt} /> : null),
}));
vi.mock("canvas-confetti", () => ({
  default: Object.assign(vi.fn(), { shapeFromPath: vi.fn(() => ({})) }),
}));

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("Quiz", () => {
  it("opens the note, pleads through every No and celebrates the corrected Yes", async () => {
    render(<Quiz answered={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^Open the note/ }));

    expect(await screen.findByRole("heading", { name: "Pop quiz", level: 1 })).toBeInTheDocument();
    for (const label of invitation.noReplies) {
      fireEvent.click(await screen.findByRole("button", { name: label }));
    }
    expect(await screen.findByText(invitation.correctionNote)).toBeInTheDocument();
    expect(screen.getByText(/A red pen crossed out No/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /corrected to yes/ }));

    expect(await screen.findByText(invitation.yesTitle)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/yes");
    await waitFor(() => expect(screen.queryByRole("button", { name: /corrected/ })).not.toBeInTheDocument());
    expect(screen.getByRole("img", { name: invitation.yesSticker.alt })).toBeInTheDocument();
  });

  it("turns bonus answers into the hall pass, the score and the message", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: { writeText } });
    render(<Quiz answered />);

    const pass = screen.getByRole("region", { name: "Hall pass" });
    expect(within(pass).getByText("time TBD")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Afternoon/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Bubble tea/ }));

    expect(within(pass).getByText(/2:00 PM/)).toBeInTheDocument();
    expect(within(pass).getByText("Bubble tea 🧋")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();

    fireEvent.click(within(pass).getByRole("button", { name: `Tell ${invitation.from}` }));
    expect(await within(pass).findByRole("status")).toHaveTextContent("Copied!");
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^I said YES ♡ Study date on .+ at 2:00 PM\./));
  });

  it("renders a server-side answer finished, and retakes from a clean sheet", async () => {
    window.history.replaceState(null, "", "/yes");
    render(<Quiz answered />);
    expect(screen.queryByRole("button", { name: /Open the note/ })).not.toBeInTheDocument();
    expect(screen.getByText(invitation.yesTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Evening/ }));
    fireEvent.click(screen.getByRole("button", { name: /Retake the quiz/ }));

    expect(await screen.findByRole("button", { name: "No" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
    await waitFor(() => expect(screen.queryByText(invitation.yesTitle)).not.toBeInTheDocument());
    expect(window.localStorage.getItem("date-asking:v1")).toContain('"time":null');
  });

  it("remembers the sound switch", () => {
    render(<Quiz answered={false} />);
    const toggle = screen.getByRole("button", { name: "Sound effects" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("date-asking:v1")).toContain('"muted":true');
  });
});
