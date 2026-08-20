import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  workers: 1,
  use: { baseURL: "http://localhost:3000", browserName: "chromium", launchOptions: { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" } },
  webServer: [
    { command: "pnpm --filter @hhlawyer/api exec tsx src/scripts/e2e-test-server.ts", url: "http://localhost:4000/api/v1/health", reuseExistingServer: false },
    { command: "pnpm --filter @hhlawyer/web dev", url: "http://localhost:3000/consultation", reuseExistingServer: false },
  ],
});
