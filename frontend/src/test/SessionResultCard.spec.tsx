import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  SessionResultCard,
  type SessionResultData,
} from "@/components/SessionResultCard";
// Shared fixture: words used across frontend and backend tests.
import sampleWords from "../../../shared/test/fixtures/words/sample-words.json";

const [FIRST_WORD, SECOND_WORD] = sampleWords as string[];

const won: SessionResultData = {
  kind: "daily",
  word: FIRST_WORD,
  won: true,
  guessCount: 4,
  streak: 7,
  sessionId: "sess_fixture_win",
  txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  date: "2026-07-25",
};

const lost: SessionResultData = {
  kind: "daily",
  word: SECOND_WORD,
  won: false,
  guessCount: 6,
  streak: 0,
  sessionId: "sess_fixture_loss",
  date: "2026-07-24",
};

const inProgress: SessionResultData = {
  kind: "interrupted",
  word: "",
  won: false,
  guessCount: 3,
  streak: 2,
};

describe("SessionResultCard – win", () => {
  it("shows the congratulatory outcome, guess count and streak", () => {
    render(<SessionResultCard result={won} />);
    expect(screen.getByText("Solved ✓")).toBeInTheDocument();
    expect(screen.getByText("4/6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByLabelText("4 guesses used")).toBeInTheDocument();
  });

  it("shows the word, the date and the abbreviated transaction hash", () => {
    render(<SessionResultCard result={won} />);
    expect(screen.getByText(FIRST_WORD.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText("2026-07-25")).toBeInTheDocument();
    expect(screen.getByTitle(won.txHash!)).toBeInTheDocument();
  });

  it("labels the article for assistive technology", () => {
    render(<SessionResultCard result={won} />);
    expect(
      screen.getByRole("article", { name: "Daily session result" }),
    ).toBeInTheDocument();
  });
});

describe("SessionResultCard – loss", () => {
  it("reveals the target word and shows the loss messaging", () => {
    render(<SessionResultCard result={lost} />);
    expect(screen.getByText(SECOND_WORD.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText("Better luck next time")).toBeInTheDocument();
    expect(screen.getByText("X/6")).toBeInTheDocument();
    expect(screen.queryByText("Solved ✓")).not.toBeInTheDocument();
  });

  it("uses singular wording for a single guess", () => {
    render(<SessionResultCard result={{ ...lost, guessCount: 1 }} />);
    expect(screen.getByLabelText("1 guess used")).toBeInTheDocument();
  });
});

describe("SessionResultCard – in progress (interrupted)", () => {
  it("shows the incomplete state and hides the word and guess grid", () => {
    render(<SessionResultCard result={inProgress} />);
    expect(screen.getAllByText("Incomplete").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("article", { name: "Incomplete session result" }),
    ).toBeInTheDocument();
    expect(screen.getByText("———")).toBeInTheDocument();
    expect(screen.queryByLabelText(/guesses? used/)).not.toBeInTheDocument();
    expect(screen.queryByText("Solved ✓")).not.toBeInTheDocument();
  });

  it("does not offer the share-card preview for an incomplete session", () => {
    render(<SessionResultCard result={inProgress} />);
    expect(
      screen.queryByRole("button", { name: "Toggle share card preview" }),
    ).not.toBeInTheDocument();
  });
});

describe("SessionResultCard – sharing", () => {
  it.each([
    ["win", won],
    ["loss", lost],
  ])("has a share button on a completed session (%s)", (_label, result) => {
    render(<SessionResultCard result={result} />);
    expect(
      screen.getByRole("button", { name: "Share your result" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Toggle share card preview" }),
    ).toBeInTheDocument();
  });

  it("passes the share text to onShare", () => {
    const onShare = vi.fn();
    render(<SessionResultCard result={won} onShare={onShare} />);
    fireEvent.click(screen.getByRole("button", { name: "Share your result" }));
    expect(onShare).toHaveBeenCalledTimes(1);
    const text = onShare.mock.calls[0][0] as string;
    expect(text).toContain("DeWordle Daily · 2026-07-25");
    expect(text).toContain("Solved in 4/6 — Streak: 7");
    expect(text.split("\n")).toHaveLength(8); // 2 header lines + 6 grid rows
  });

  it("describes a loss as unsolved in the share text", () => {
    const onShare = vi.fn();
    render(<SessionResultCard result={lost} onShare={onShare} />);
    fireEvent.click(screen.getByRole("button", { name: "Share your result" }));
    expect(onShare.mock.calls[0][0]).toContain("Did not solve");
  });

  it("toggles the share card preview", () => {
    render(<SessionResultCard result={won} />);
    const toggle = screen.getByRole("button", {
      name: "Toggle share card preview",
    });
    expect(toggle).toHaveTextContent("Show Card");
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("Hide Card");
  });
});

describe("SessionResultCard – accessibility", () => {
  it("gives every interactive element an accessible name", () => {
    render(<SessionResultCard result={won} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAccessibleName();
    }
  });

  it("uses real buttons that are keyboard focusable", () => {
    render(<SessionResultCard result={won} />);
    const share = screen.getByRole("button", { name: "Share your result" });
    share.focus();
    expect(share).toHaveFocus();
    expect(share).toHaveAttribute("type", "button");
  });
});
