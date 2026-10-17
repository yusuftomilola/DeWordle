import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.spec.ts"],
    // events.spec.ts predates vitest: it is a standalone script that exits the
    // process, run with `npx tsx events.spec.ts`.
    exclude: ["node_modules/**", "events.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["*.ts"],
      // index.ts only re-exports; events.ts is covered by events.spec.ts (tsx).
      exclude: ["**/*.spec.ts", "index.ts", "events.ts", "testing/**", "vitest.config.ts"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 },
    },
  },
});
