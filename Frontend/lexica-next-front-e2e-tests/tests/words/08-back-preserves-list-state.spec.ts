import { test, expect } from '@playwright/test';
import { captureAuthToken, createWordViaApi, deleteWordsViaApi, searchWord } from './helpers';

test.describe('words list back preserves table state', () => {
  const wordIds: string[] = [];
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);
    await createWordViaApi(page, 'bookcase', 'regał', authToken, { createdWordIds: wordIds });

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteWordsViaApi(page, wordIds, authToken);
    await page.close();
    await context.close();
  });

  test('Edit -> Go back keeps searchQuery in /words URL', async ({ page }) => {
    await page.goto('/words');
    await searchWord(page, 'bookcase');

    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) });
    await expect(row).toBeVisible();

    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/[^/]+\/edit/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent('bookcase')}`));
  });

  test('Create New Word -> Go back keeps searchQuery in /words URL', async ({ page }) => {
    await page.goto('/words');
    await searchWord(page, 'bookcase');

    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back to words' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent('bookcase')}`));
  });
});
