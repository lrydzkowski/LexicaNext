import { test, expect } from '@playwright/test';
import { generateTestPrefix, captureAuthToken, createWordViaApi, deleteWordsByPrefix, waitForWordsResponse } from './helpers';

const WORD_COUNT = 11;

test.describe('words pagination', () => {
  let prefix: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('page');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    const authToken = await captureAuthToken(page);
    const createPromises = Array.from({ length: WORD_COUNT }, (_, i) =>
      createWordViaApi(page, `${prefix}-${String(i + 1).padStart(2, '0')}`, `tlumaczenie-${i + 1}`, authToken),
    );
    await Promise.all(createPromises);

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
