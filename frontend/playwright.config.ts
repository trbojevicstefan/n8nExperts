import { defineConfig } from "@playwright/test";

const configuredBaseURL = process.env.E2E_BASE_URL;
const localBaseURL = "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: configuredBaseURL || localBaseURL,
    trace: "retain-on-failure",
  },
  webServer: configuredBaseURL
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1",
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
