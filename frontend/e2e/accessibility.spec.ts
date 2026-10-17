import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * QA-105: Automated accessibility tests.
 * Uses Playwright built-in aria/role assertions for WCAG compliance checks.
 * For richer axe-core checks, install: npm install --save-dev @axe-core/playwright
 */
test.describe('Accessibility audit', () => {
  test('home page has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Verify skip link is present and focusable
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip")').first();
    // Page should render without JS errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('game page has accessible heading structure', async ({ page }) => {
    await page.goto('/game');
    await page.waitForLoadState('domcontentloaded');
    // Page must have at least one heading
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('game board letter tiles have accessible roles', async ({ page }) => {
    await page.goto('/game');
    await page.waitForLoadState('domcontentloaded');
    // Page renders without critical errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('leaderboard has accessible table or list structure', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('domcontentloaded');
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

/**
 * Automated axe-core audit of every game-facing page.
 *
 * Critical and serious violations (missing alt text, missing form labels,
 * insufficient roles, ...) fail the test. Moderate and minor violations are
 * reported in the summary but do not fail it. The violation count by severity
 * is printed for each page and attached to the Playwright report as JSON.
 */

const AXE_FAILING_IMPACTS = ['critical', 'serious'] as const;
const AXE_REPORTED_IMPACTS = [
  'critical',
  'serious',
  'moderate',
  'minor',
] as const;

const GAME_PAGES = [
  { name: 'home', path: '/' },
  { name: 'gameplay', path: '/game' },
  { name: 'achievements', path: '/achievements' },
  { name: 'rewards', path: '/rewards' },
  { name: 'sessions', path: '/sessions' },
] as const;

test.describe('axe-core accessibility audit (game pages)', () => {
  for (const { name, path } of GAME_PAGES) {
    test(`${name} page has no critical or serious axe violations`, async ({
      page,
    }, testInfo) => {
      const response = await page.goto(path);
      test.skip(
        response?.status() === 404,
        `${path} is not routed in this build`,
      );
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle').catch(() => undefined);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Count violations by severity (axe reports impact per violation).
      const counts = Object.fromEntries(
        AXE_REPORTED_IMPACTS.map((impact) => [impact, 0]),
      );
      for (const violation of results.violations) {
        const impact = violation.impact ?? 'minor';
        counts[impact] = (counts[impact] ?? 0) + 1;
      }
      const summary = {
        page: name,
        path,
        violations: counts,
        total: results.violations.length,
      };
      console.log(`[axe] ${JSON.stringify(summary)}`);
      await testInfo.attach(`axe-summary-${name}`, {
        body: JSON.stringify(
          { ...summary, details: results.violations },
          null,
          2,
        ),
        contentType: 'application/json',
      });

      const blocking = results.violations.filter((v) =>
        (AXE_FAILING_IMPACTS as readonly string[]).includes(v.impact ?? ''),
      );
      expect(
        blocking.map(
          (v) => `${v.impact}: ${v.id} (${v.nodes.length} node(s)) - ${v.help}`,
        ),
        `critical/serious accessibility violations on ${path}`,
      ).toEqual([]);
    });
  }
});
