import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

interface UserGroup {
  name: string;
  testDir: string;
}

const userGroups: UserGroup[] = [
  { name: 'user-a', testDir: './tests' },
  { name: 'user-b', testDir: './tests' },
];

const browsers = [
  { suffix: 'chromium', device: devices['Desktop Chrome'] },
  { suffix: 'firefox', device: devices['Desktop Firefox'] },
  { suffix: 'webkit', device: devices['Desktop Safari'] },
];

function createGroupProjects(group: UserGroup) {
  const setupName = `${group.name}-setup`;
  const authFile = `playwright/.auth/${group.name}.json`;

  const setupProject = {
    name: setupName,
    testMatch: new RegExp(`${group.name}\\.setup\\.ts`),
    testDir: './tests/auth',
  };

  const browserProjects = browsers.map((browser, index) => ({
    name: `${group.name}-${browser.suffix}`,
    use: { ...browser.device, storageState: authFile },
    testDir: group.testDir,
    fullyParallel: false,
    dependencies: index === 0 ? [setupName] : [`${group.name}-${browsers[index - 1].suffix}`],
  }));

  return [setupProject, ...browserProjects];
}

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
  },
  projects: userGroups.flatMap(createGroupProjects),
});
