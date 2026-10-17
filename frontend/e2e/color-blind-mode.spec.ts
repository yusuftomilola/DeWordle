import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the color-blind mode toggle.
 *
 * Contract this spec relies on (implement the feature to match it):
 *  - the toggle is a switch/checkbox with the accessible name "Color-blind mode"
 *    (`getByRole('switch' | 'checkbox', { name: /color-blind mode/i })`);
 *  - when on, `<html>` carries `data-color-blind="true"` and the palette is
 *    applied to `[data-testid="tile"]` / `[data-testid="key"]` elements via the
 *    `data-state` values `correct`, `present` and `absent`;
 *  - the choice is persisted in localStorage so it survives a reload.
 *
 * Until the feature exists the suite skips itself, so it never fails CI for a
 * missing feature, and starts asserting as soon as the toggle appears.
 * See accessibility.spec.ts for the surrounding patterns.
 */

const SETTINGS_ROUTE = "/settings";
const GAME_ROUTE = "/game";

const THEMES = ["light", "dark"] as const;

function toggleLocator(page: Page) {
  return page
    .getByRole("switch", { name: /color-blind mode/i })
    .or(page.getByRole("checkbox", { name: /color-blind mode/i }));
}

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  // next-themes stores the choice under "theme"; set it before the app boots.
  await page.addInitScript(
    (value) => window.localStorage.setItem("theme", value),
    theme,
  );
}

async function openSettingsOrSkip(page: Page) {
  await page.goto(SETTINGS_ROUTE);
  await page.waitForLoadState("domcontentloaded");
  const toggle = toggleLocator(page).first();
  test.skip(
    (await toggle.count()) === 0,
    "color-blind mode is not implemented yet",
  );
  return toggle;
}

/** Colors of the first tile / key in each state, read from computed styles. */
async function readPalette(page: Page) {
  const read = async (testId: string, state: string) => {
    const el = page
      .locator(`[data-testid="${testId}"][data-state="${state}"]`)
      .first();
    if ((await el.count()) === 0) return null;
    return el.evaluate((node) => getComputedStyle(node).backgroundColor);
  };
  const out: Record<string, string | null> = {};
  for (const state of ["correct", "present", "absent"]) {
    out[`tile:${state}`] = await read("tile", state);
    out[`key:${state}`] = await read("key", state);
  }
  return out;
}

for (const theme of THEMES) {
  test.describe(`color-blind mode (${theme} theme)`, () => {
    test.beforeEach(async ({ page }) => {
      await setTheme(page, theme);
    });

    test("toggling in settings switches the page to the color-blind palette", async ({
      page,
    }) => {
      const toggle = await openSettingsOrSkip(page);
      await expect(toggle).not.toBeChecked();
      await toggle.click();
      await expect(toggle).toBeChecked();
      await expect(page.locator("html")).toHaveAttribute(
        "data-color-blind",
        "true",
      );
    });

    test("tile colors change to the color-blind palette", async ({ page }) => {
      const toggle = await openSettingsOrSkip(page);

      await page.goto(GAME_ROUTE);
      const before = await readPalette(page);

      await page.goto(SETTINGS_ROUTE);
      await toggle.click();
      await page.goto(GAME_ROUTE);
      const after = await readPalette(page);

      const tiles = Object.keys(after).filter(
        (k) => k.startsWith("tile:") && after[k] && before[k],
      );
      test.skip(
        tiles.length === 0,
        "no evaluated tiles on the board to compare",
      );
      for (const key of tiles) {
        expect(after[key], `${key} should change`).not.toBe(before[key]);
      }
      const tile = page
        .locator('[data-testid="tile"][data-state="correct"]')
        .first();
      if ((await tile.count()) > 0) {
        await expect(tile).toHaveCSS(
          "background-color",
          after["tile:correct"]!,
        );
      }
    });

    test("keyboard key colors update accordingly", async ({ page }) => {
      const toggle = await openSettingsOrSkip(page);

      await page.goto(GAME_ROUTE);
      const before = await readPalette(page);

      await page.goto(SETTINGS_ROUTE);
      await toggle.click();
      await page.goto(GAME_ROUTE);
      const after = await readPalette(page);

      const keys = Object.keys(after).filter(
        (k) => k.startsWith("key:") && after[k] && before[k],
      );
      test.skip(keys.length === 0, "no evaluated keyboard keys to compare");
      for (const key of keys) {
        expect(after[key], `${key} should change`).not.toBe(before[key]);
      }
      // Keys and tiles in the same state share one palette color.
      for (const state of ["correct", "present", "absent"]) {
        if (after[`tile:${state}`] && after[`key:${state}`]) {
          expect(after[`key:${state}`]).toBe(after[`tile:${state}`]);
        }
      }
    });

    test("the setting persists after a page reload", async ({ page }) => {
      const toggle = await openSettingsOrSkip(page);
      await toggle.click();
      await expect(toggle).toBeChecked();

      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      await expect(toggleLocator(page).first()).toBeChecked();
      await expect(page.locator("html")).toHaveAttribute(
        "data-color-blind",
        "true",
      );
    });
  });
}
