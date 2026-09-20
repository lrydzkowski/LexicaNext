import { test, expect } from '@playwright/test';
import { captureAuthToken, createWordViaApi, deleteWordsViaApi, waitForWordsResponse } from './helpers';

import { bookWords } from './test-words';

const WORD_COUNT = 11;

test.describe('words pagination', () => {
  const wordIds: string[] = [];
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);
    for (const { word, translation } of bookWords.slice(0, WORD_COUNT)) {
      await createWordViaApi(page, word, translation, authToken, { createdWordIds: wordIds });
    }

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

  test('pagination controls appear when enough words exist', async ({ page }) => {
    const wordsResponsePromise = waitForWordsResponse(page);
    await page.goto('/words');
    await wordsResponsePromise;

    await expect(page.getByRole('table')).toBeVisible();

    const pagination = page.locator('.mantine-Pagination-root');
    await expect(pagination).toBeVisible();

    const tableBodyRows = page
      .getByRole('table')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(tableBodyRows).toHaveCount(10);
  });

  test('navigates to next page', async ({ page }) => {
    const initialResponse = waitForWordsResponse(page);
    await page.goto('/words');
    await initialResponse;

    await expect(page.getByRole('table')).toBeVisible();

    const table = page.getByRole('table');
    const firstDataRow = table.getByRole('row').nth(1);
    const firstRowWordCell = firstDataRow.getByRole('cell').nth(1);
    const firstRowWord = await firstRowWordCell.textContent();

    const pagination = page.locator('.mantine-Pagination-root');
    const page2Response = page.waitForResponse(
      (resp) => resp.url().includes('/api/words') && resp.url().includes('page=2') && resp.request().method() === 'GET',
    );
    await pagination.getByRole('button', { name: '2', exact: true }).click();
    await page2Response;

    await expect(page).toHaveURL(/page=2/);
    await expect(firstRowWordCell).not.toHaveText(firstRowWord!);
  });
});
