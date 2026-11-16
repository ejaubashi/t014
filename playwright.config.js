import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3021/t014/",
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command:
      "BASE_PATH=/t014/ npm run build && node scripts/serve.mjs --port 3021 --base /t014/",
    url: "http://127.0.0.1:3021/t014/",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
