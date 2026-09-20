import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

interface UserGroup {
  name: string;
  browser: string;
  device: (typeof devices)[string];
}

const userGroups: UserGroup[] = [
  { name: 'user-a', browser: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'user-b', browser: 'webkit', device: devices['Desktop Safari'] },
];

function createGroupProjects(group: UserGroup) {
  const setupName = `${group.name}-setup`;
  const authFile = `playwright/.auth/${group.name}.json`;

  const setupProject = {
    name: setupName,
    testMatch: new RegExp(`${group.name}\\.setup\\.ts`),
    testDir: './tests',
    use: { ...group.device },
  };

  const browserProject = {
    name: `${group.name}-${group.browser}`,
    use: { ...group.device, storageState: authFile },
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    dependencies: [setupName],
  };

  return [setupProject, browserProject];
}

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    proxy: proxyServer ? { server: proxyServer, bypass: process.env.NO_PROXY } : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: userGroups.flatMap(createGroupProjects),
});
