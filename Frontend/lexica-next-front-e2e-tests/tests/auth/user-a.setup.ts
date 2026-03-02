import { test as setup } from '@playwright/test';
import { getAuthConfig, getAuthFilePath, authenticate } from './authenticate';

const group = 'user-a';

setup('authenticate', async ({ page }) => {
  const config = getAuthConfig(group);
  await authenticate(page, config);
  await page.context().storageState({ path: getAuthFilePath(group) });
});
