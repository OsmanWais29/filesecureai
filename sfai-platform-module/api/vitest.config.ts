import { defineConfig } from "vitest/config";

// PGlite starts a real Postgres per test file: allow a little more time
export default defineConfig({ test: { testTimeout: 30_000, hookTimeout: 30_000 } });
