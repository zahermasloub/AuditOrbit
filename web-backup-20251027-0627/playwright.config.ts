import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.WEB_PORT || "3000";
const BASE = process.env.WEB_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  reporter: [["list"]],
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.PW_DEV ? "pnpm dev" : "pnpm build && pnpm start -p " + PORT,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: process.env.PW_DEV ? "development" : "production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
