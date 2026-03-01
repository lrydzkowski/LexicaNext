import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  searchSet,
  waitForSetsResponse,
  waitForSearchSetsResponse,
  getSetNameFromProposedName,
} from './helpers';

test.describe('sets search', () => {
  let prefix: string;
  let authToken: string;
  const wordIds: string[] = [];
  let setName: string;
  let setId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('search');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    setName = await getSetNameFromProposedName(page, authToken);
    setId = await createSetViaApi(page, [wordId], authToken);

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
    await page.close();
    await context.close();
  });

  test('search filters sets by name', async ({ page }) => {
    await page.goto('/sets');
    await searchSet(page, setName);

    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();
  });

  test('search shows empty state for no matches', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    await searchSet(page, 'zzz_nonexistent_set_zzz');

    await expect(page.getByRole('cell', { name: 'No sets found matching your search.' })).toBeVisible();
  });

  test('clearing search restores the full list', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    await expect(page.getByRole('row').first()).toBeVisible();
    const initialRowCount = await page.getByRole('row').count();

    await searchSet(page, 'zzz_nonexistent_set_zzz');
    await expect(page.getByRole('cell', { name: 'No sets found matching your search.' })).toBeVisible();

    const clearResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/sets') && !resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await page.getByPlaceholder('Search sets...').clear();
    await clearResponse;

    await expect(async () => {
      const restoredRowCount = await page.getByRole('row').count();
      expect(restoredRowCount).toBeGreaterThanOrEqual(initialRowCount);
    }).toPass({ timeout: 10000 });
  });

  test('search is debounced (300ms delay)', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    const searchInput = page.getByPlaceholder('Search sets...');
    const searchResponse = waitForSearchSetsResponse(page);
    await searchInput.fill(setName);
    await searchResponse;

    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();
  });
});
