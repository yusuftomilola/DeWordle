import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, renderHook } from "@testing-library/react";
import { GuessHistorySidebar } from "@/components/GuessHistorySidebar";
import { clearGuesses, recordGuess } from "@/store/useGuessHistoryStore";
import { AchievementCelebration, CELEBRATION_DURATION_MS } from "@/components/AchievementCelebration";
import { announceAchievement, clearAchievements } from "@/store/useAchievementStore";
import { DifficultyBadge, DailyDifficultyBadge } from "@/components/DifficultyBadge";
import { fetchDailyDifficulty } from "@/lib/difficulty";
import { SettingsProvider } from "@/providers/settings-provider";
import { SettingsPanel } from "@/components/SettingsPanel";
import { resolveConflict, fetchActiveSession, pushSessionState } from "@/lib/session-sync";
import { useSessionSync } from "@/hooks/useSessionSync";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

const word = (w: string, states: Array<"correct" | "present" | "absent">) =>
  w.split("").map((letter, i) => ({ letter, state: states[i] }));

beforeEach(() => {
  localStorage.clear();
  clearGuesses();
  clearAchievements();
});
afterEach(() => vi.useRealTimers());

describe("guess history sidebar (#1541)", () => {
  it("lists guesses in order with colour states and highlights the latest", () => {
    recordGuess(word("crane", ["absent", "present", "correct", "absent", "absent"]), 1);
    recordGuess(word("slate", ["correct", "correct", "correct", "correct", "correct"]), 2);
    const { container } = render(<GuessHistorySidebar />);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('[data-state="present"]')?.textContent).toBe("r");
    expect(items[0].hasAttribute("data-latest")).toBe(false);
    expect(items[1].getAttribute("data-latest")).toBe("true");
    expect(items[1].getAttribute("aria-current")).toBe("true");
  });

  it("can be collapsed and shows an empty state", () => {
    render(<GuessHistorySidebar />);
    expect(screen.getByText("No guesses yet")).toBeTruthy();
    const toggle = screen.getByRole("button", { name: /guesses/i });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("guess-history-list")?.hasAttribute("hidden")).toBe(true);
  });
});

describe("achievement celebration (#1542)", () => {
  const renderCelebration = (onSound = vi.fn()) =>
    render(
      <SettingsProvider>
        <AchievementCelebration onSound={onSound} />
      </SettingsProvider>,
    );

  it("shows badge and name, then auto-dismisses after 3 seconds", () => {
    vi.useFakeTimers();
    renderCelebration();
    act(() => announceAchievement({ id: "a1", name: "First Win", icon: "🏆" }));
    expect(screen.getByText("First Win")).toBeTruthy();
    expect(screen.getByText("🏆")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(CELEBRATION_DURATION_MS - 1));
    expect(screen.queryByText("First Win")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByText("First Win")).toBeNull();
  });

  it("plays sound only when sound effects are enabled", () => {
    const quiet = vi.fn();
    const { unmount } = renderCelebration(quiet);
    act(() => announceAchievement({ id: "q", name: "Quiet", icon: "x" }));
    expect(quiet).not.toHaveBeenCalled();
    unmount();
    clearAchievements();

    localStorage.setItem("dewordle-settings", JSON.stringify({ soundEffects: true }));
    const loud = vi.fn();
    renderCelebration(loud);
    act(() => announceAchievement({ id: "l", name: "Loud", icon: "x" }));
    expect(loud).toHaveBeenCalledTimes(1);
  });

  it("queues multiple unlocks and ignores duplicates", () => {
    vi.useFakeTimers();
    renderCelebration();
    act(() => {
      announceAchievement({ id: "a", name: "One", icon: "1" });
      announceAchievement({ id: "a", name: "One", icon: "1" });
      announceAchievement({ id: "b", name: "Two", icon: "2" });
    });
    expect(screen.getByText("One")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(CELEBRATION_DURATION_MS));
    expect(screen.getByText("Two")).toBeTruthy();
  });
});

describe("difficulty badge (#1543)", () => {
  it("maps each level to its colour and exposes the criteria", () => {
    const { rerender } = render(<DifficultyBadge difficulty="EASY" />);
    expect(screen.getByText("Easy").className).toContain("bg-green-600");
    expect(screen.getByText("Easy").getAttribute("title")).toMatch(/common the word/);
    rerender(<DifficultyBadge difficulty="MEDIUM" />);
    expect(screen.getByText("Medium").className).toContain("bg-yellow-500");
    rerender(<DifficultyBadge difficulty="HARD" />);
    expect(screen.getByText("Hard").className).toContain("bg-red-600");
  });

  it("fetchDailyDifficulty handles valid, invalid and failing responses", async () => {
    const ok = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ difficulty: "hard" }) });
    expect(await fetchDailyDifficulty(ok as never, "http://x")).toBe("HARD");
    expect(ok).toHaveBeenCalledWith("http://x/api/v1/words/daily");
    const bad = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ difficulty: "nope" }) });
    expect(await fetchDailyDifficulty(bad as never)).toBeNull();
    const boom = vi.fn().mockRejectedValue(new Error("down"));
    expect(await fetchDailyDifficulty(boom as never)).toBeNull();
  });

  it("renders from the API and can be hidden in settings", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ difficulty: "MEDIUM" }) });
    render(
      <SettingsProvider>
        <SettingsPanel />
        <DailyDifficultyBadge fetchImpl={fetchImpl as never} />
      </SettingsProvider>,
    );
    expect(await screen.findByText("Medium")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: /difficulty badge/i }));
    expect(screen.queryByText("Medium")).toBeNull();
    expect(JSON.parse(localStorage.getItem("dewordle-settings")!).showDifficultyBadge).toBe(false);
  });
});

describe("multi-device sync (#1544)", () => {
  const s = (updatedAt: number, guesses: string[] = []) => ({ sessionId: "s1", guesses, updatedAt });

  it("conflict resolution favours the most recent guess", () => {
    expect(resolveConflict(s(1), s(2))?.updatedAt).toBe(2);
    expect(resolveConflict(s(3), s(2))?.updatedAt).toBe(3);
    const local = s(5);
    expect(resolveConflict(local, s(5))).toBe(local);
    expect(resolveConflict(null, s(1))?.updatedAt).toBe(1);
    expect(resolveConflict(s(1), null)?.updatedAt).toBe(1);
  });

  it("client pushes partial state and parses the active session", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true });
    await pushSessionState(s(9, ["crane"]), { fetchImpl: f as never, apiBase: "http://x" });
    expect(f.mock.calls[0][0]).toBe("http://x/api/v1/sessions/s1/state");
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ guesses: ["crane"], updatedAt: 9 });
    await expect(
      pushSessionState(s(1), { fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500 }) as never }),
    ).rejects.toThrow(/500/);

    const none = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    expect(await fetchActiveSession({ fetchImpl: none as never })).toBeNull();
    const junk = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ foo: 1 }) });
    expect(await fetchActiveSession({ fetchImpl: junk as never })).toBeNull();
  });

  it("adopts a newer remote session, polls every 10s and retries silently on failure", async () => {
    vi.useFakeTimers();
    const remote = s(100, ["slate"]);
    let fail = true;
    const f = vi.fn(async (url: string, init?: { method?: string }) => {
      if (fail) throw new Error("offline");
      if (init?.method === "PATCH") return { ok: true } as Response;
      return { ok: true, status: 200, json: async () => remote } as unknown as Response;
    });
    const onRemote = vi.fn();
    const { result } = renderHook(() =>
      useSessionSync({ local: s(50, ["crane"]), onRemoteState: onRemote, fetchImpl: f as never }),
    );
    await act(async () => {});
    expect(result.current.status).toBe("retrying");
    expect(onRemote).not.toHaveBeenCalled();

    fail = false;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(result.current.status).toBe("synced");
    expect(onRemote).toHaveBeenCalledWith(remote);
    expect(result.current.lastSyncedAt).not.toBeNull();
  });

  it("indicator renders each status", () => {
    const { rerender } = render(<SyncStatusIndicator status="synced" />);
    expect(screen.getByRole("status").textContent).toContain("Synced");
    rerender(<SyncStatusIndicator status="retrying" />);
    expect(screen.getByRole("status").getAttribute("data-status")).toBe("retrying");
  });
});
