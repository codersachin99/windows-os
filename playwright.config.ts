import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:1420",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: "npm run dev",
    // Only the Playwright server opts in a known parent origin for embed tests.
    env: { VITE_EMBED_ORIGINS: "http://127.0.0.1:1420" },
    url: "http://127.0.0.1:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});
