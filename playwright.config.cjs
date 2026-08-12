const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  use: {
    channel: "chrome",
    baseURL: "http://localhost:3000",
    viewport: { width: 1440, height: 900 },
  },
});
