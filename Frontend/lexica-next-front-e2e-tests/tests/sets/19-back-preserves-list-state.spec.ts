import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  createSetViaApi,
  createWordViaApiReturningId,
  deleteSetViaApi,
  deleteWordsViaApi,
  generateTestPrefix,
  searchSet,
} from './helpers';

test.describe('sets list back preserves table state', () => {
  let prefix: string;
  let authToken: string;
  let wordId: string;
  let setId: string;
  let setName: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('sets-back');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);
    wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    setId = await createSetViaApi(page, [wordId], authToken);

    const response = await page.request.get(`/api/sets/${setId}`, {
      headers: { authorization: authToken },
    });
    const body = await response.json();
    setName = body.name as string;

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, [wordId], authToken);
    await page.close();
    await context.close();
  });

  test('Edit Set -> Go back keeps searchQuery in /sets URL', async ({ page }) => {
    await page.goto('/sets');
    await searchSet(page, setName);

    await page
      .getByRole('button', { name: `Actions for ${setName}` })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Edit Set' }).click();

    await expect(page).toHaveURL(/\/sets\/[^/]+\/edit/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent(setName)}`));
  });

  test('View Content -> Go back keeps searchQuery in /sets URL', async ({ page }) => {
    await page.goto('/sets');
    await searchSet(page, setName);

    await page
      .getByRole('button', { name: `Actions for ${setName}` })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'View Content' }).click();

    await expect(page).toHaveURL(/\/sets\/[^/]+\/content/);
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent(setName)}`));
  });
});
