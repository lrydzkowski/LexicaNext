import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  createWordViaApi,
  deleteWordsByPrefix,
  generateTestPrefix,
  searchWord,
} from './helpers';

test.describe('words list back preserves table state', () => {
  let prefix: string;
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('words-back');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);
    await createWordViaApi(page, `${prefix}-alpha`, 'translation-a', authToken);

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteWordsByPrefix(page, prefix);
    await page.close();
    await context.close();
  });

  test('Edit -> Go back keeps searchQuery in /words URL', async ({ page }) => {
    await page.goto('/words');
    await searchWord(page, prefix);

    const row = page.getByRole('row').filter({ hasText: `${prefix}-alpha` });
    await expect(row).toBeVisible();

    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/[^/]+\/edit/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent(prefix)}`));
  });

  test('Create New Word -> Go back keeps searchQuery in /words URL', async ({ page }) => {
    await page.goto('/words');
    await searchWord(page, prefix);

    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back to words' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent(prefix)}`));
  });
});
