import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  if (!process.env.AUTH_EMAIL) {
    throw new Error('AUTH_EMAIL environment variable is not set. Copy .env.example to .env and fill in values.');
  }

  if (!process.env.AUTH_PASSWORD) {
    throw new Error('AUTH_PASSWORD environment variable is not set. Copy .env.example to .env and fill in values.');
  }

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In to Continue' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.AUTH_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.AUTH_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.waitForURL('/sets');

  await page.context().storageState({ path: authFile });
});
