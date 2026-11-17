import { defineConfig, devices } from "@playwright/test";

const PREVIEW_HOST = "127.0.0.1";
const PREVIEW_PORT = 4173;
const BASE_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 3 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: {
    // Pagefind UI 与索引冷加载在多 worker 并行争用下可能超过 10s
    timeout: 20_000,
  },
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `bun run preview -- --host ${PREVIEW_HOST} --port ${PREVIEW_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], contextOptions: { reducedMotion: "no-preference" } },
    },
    {
      name: "chromium-reduced",
      use: { ...devices["Desktop Chrome"], contextOptions: { reducedMotion: "reduce" } },
    },
    {
      name: "chromium-mobile",
      grep: /@responsive/,
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 812 },
        contextOptions: { reducedMotion: "no-preference" },
      },
    },
    {
      name: "chromium-mobile-reduced",
      grep: /@responsive/,
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 812 },
        contextOptions: { reducedMotion: "reduce" },
      },
    },
    ...(process.env.PLAYWRIGHT_WEBKIT === "1"
      ? [
          {
            name: "webkit-mobile",
            grep: /@responsive/,
            use: { ...devices["iPhone 13"] },
          },
        ]
      : []),
  ],
});
