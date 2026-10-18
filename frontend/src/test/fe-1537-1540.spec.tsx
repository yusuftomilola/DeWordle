import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act, renderHook } from "@testing-library/react";
import { clampZoom, stepZoom } from "@/lib/zoom";
import { resolveTheme, applyTheme, NO_FLASH_SCRIPT } from "@/lib/theme";
import { ZoomControls, ZoomContainer } from "@/components/ZoomControls";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PlayerProfileCard, Identicon, shortenAddress } from "@/components/PlayerProfileCard";
import { createMemoryStore, syncDictionary } from "@/lib/word-dictionary-cache";
import { useOfflineSession } from "@/hooks/useOfflineSession";
import { useVisualSettings } from "@/hooks/useVisualSettings";
import { useTheme } from "@/hooks/useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("zoom (#1537)", () => {
  it("clamps and snaps to 25% steps within 100-200", () => {
    expect(clampZoom(50)).toBe(100);
    expect(clampZoom(260)).toBe(200);
    expect(clampZoom(137)).toBe(125);
    expect(stepZoom(100, -1)).toBe(100);
    expect(stepZoom(175, 1)).toBe(200);
  });

  it("buttons and Ctrl+=/Ctrl+- change zoom", () => {
    const onChange = vi.fn();
    render(<ZoomControls zoom={125} onZoomChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(onChange).toHaveBeenLastCalledWith(150);
    fireEvent.keyDown(window, { key: "-", ctrlKey: true });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(window, { key: "=", metaKey: true });
    expect(onChange).toHaveBeenLastCalledWith(150);
  });

  it("disables buttons at the limits and scales the container", () => {
    const { rerender } = render(<ZoomControls zoom={100} onZoomChange={() => {}} />);
    expect(screen.getByLabelText("Zoom out")).toBeDisabled();
    rerender(<ZoomControls zoom={200} onZoomChange={() => {}} />);
    expect(screen.getByLabelText("Zoom in")).toBeDisabled();
    render(<ZoomContainer zoom={150}>x</ZoomContainer>);
    expect(screen.getByTestId("zoom-container").style.transform).toBe("scale(1.5)");
  });

  it("persists zoom in visual settings", () => {
    const { result } = renderHook(() => useVisualSettings());
    act(() => result.current.updateSetting("zoom", 175));
    expect(JSON.parse(localStorage.getItem("dewordle_visual_settings")!).zoom).toBe(175);
    const again = renderHook(() => useVisualSettings());
    expect(again.result.current.settings.zoom).toBe(175);
  });
});

describe("offline (#1538)", () => {
  const build = () => ({ gameId: 1, score: 1, durationSeconds: 1 });

  it("banner shows offline and syncing states, hidden otherwise", () => {
    const { rerender, container } = render(<OfflineBanner isOnline={false} />);
    expect(screen.getByRole("status").textContent).toMatch(/offline/i);
    rerender(<OfflineBanner isOnline pendingSyncCount={2} />);
    expect(screen.getByRole("status").textContent).toMatch(/syncing 2 games/);
    rerender(<OfflineBanner isOnline />);
    expect(container.firstChild).toBeNull();
  });

  it("validates guesses against the cached dictionary", async () => {
    const dictionary = createMemoryStore();
    await dictionary.putAll(["Crane", "slate"]);
    const { result } = renderHook(() => useOfflineSession({ dictionary, buildSyncResult: build }));
    expect(await result.current.validateGuess("CRANE")).toBe(true);
    expect(await result.current.validateGuess("zzzzz")).toBe(false);
  });

  it("accepts every guess when no dictionary is configured", async () => {
    const { result } = renderHook(() => useOfflineSession({ buildSyncResult: build }));
    expect(await result.current.validateGuess("anything")).toBe(true);
  });

  it("syncDictionary stores words and rejects bad payloads", async () => {
    const store = createMemoryStore();
    const ok = vi.fn().mockResolvedValue({ ok: true, json: async () => ["apple", "grape"] });
    expect(await syncDictionary(store, "/w", ok as never)).toBe(2);
    expect(await store.has("grape")).toBe(true);
    const bad = vi.fn().mockResolvedValue({ ok: true, json: async () => [1] });
    await expect(syncDictionary(store, "/w", bad as never)).rejects.toThrow(/array of strings/);
    const down = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(syncDictionary(store, "/w", down as never)).rejects.toThrow(/503/);
  });

  it("flushes queued results when connectivity returns", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const { result } = renderHook(() => useOfflineSession({ buildSyncResult: build }));
    act(() => result.current.submitGuess("crane"));
    act(() => result.current.completeSession("win"));
    expect(result.current.pendingSyncCount).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.pendingSyncCount).toBe(0);
    vi.unstubAllGlobals();
  });
});

describe("profile card (#1539)", () => {
  const addr = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  it("identicon is deterministic per address", () => {
    const a = render(<Identicon address={addr} />).container.innerHTML;
    const b = render(<Identicon address={addr} />).container.innerHTML;
    const c = render(<Identicon address={addr.replace("GB", "GA")} />).container.innerHTML;
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("renders address and stats, with zero-games win rate safe", () => {
    render(
      <PlayerProfileCard
        address={addr}
        stats={{ gamesPlayed: 4, wins: 3, currentStreak: 2, bestStreak: 5 }}
      />,
    );
    expect(screen.getByText(shortenAddress(addr))).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
    render(<PlayerProfileCard address="x" stats={{ gamesPlayed: 0, wins: 0, currentStreak: 0, bestStreak: 0 }} />);
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
  });
});

describe("theme (#1540)", () => {
  it("resolves system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("applyTheme toggles class and data attribute", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("no-flash script applies stored dark theme before hydration", () => {
    localStorage.setItem("dewordle_visual_settings", JSON.stringify({ theme: "dark" }));
    new Function(NO_FLASH_SCRIPT)();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("hook cycles light -> dark -> system and persists", () => {
    localStorage.setItem("dewordle_visual_settings", JSON.stringify({ theme: "light", zoom: 150 }));
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("light");
    act(() => result.current.cycleTheme());
    expect(result.current.preference).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const stored = JSON.parse(localStorage.getItem("dewordle_visual_settings")!);
    expect(stored).toMatchObject({ theme: "dark", zoom: 150 });
    act(() => result.current.cycleTheme());
    expect(result.current.preference).toBe("system");
  });
});
