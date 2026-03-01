import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  waitForSetsResponse,
  searchSet,
  waitForSearchSetsResponse,
} from './helpers';

const SET_COUNT = 11;

test.describe('sets pagination', () => {
  let prefix: string;
  let authToken: string;
  const wordIds: string[] = [];
  const setIds: string[] = [];

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('page');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    for (let i = 0; i < SET_COUNT; i++) {
      const setId = await createSetViaApi(page, [wordId], authToken);
      setIds.push(setId);
    }

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    if (setIds.length > 0) {
      await deleteSetViaApi(page, setIds, authToken);
    }
    await deleteWordsViaApi(page, wordIds, authToken);
    await page.close();
    await context.close();
  });

  test('pagination controls appear when more than 10 sets exist', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    await expect(page.getByRole('table')).toBeVisible();

    const pagination = page.locator('.mantine-Pagination-root');
    await expect(pagination).toBeVisible();

    const tableBodyRows = page
      .getByRole('table')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(tableBodyRows).toHaveCount(10);
  });

  test('navigates to next page and shows different sets', async ({ page }) => {
    const initialResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await initialResponse;

    await expect(page.getByRole('table')).toBeVisible();

    const table = page.getByRole('table');
    const firstDataRow = table.getByRole('row').nth(1);
    const firstRowNameCell = firstDataRow.getByRole('cell').nth(1);
    const firstRowName = await firstRowNameCell.textContent();

    const pagination = page.locator('.mantine-Pagination-root');
    const page2Response = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.url().includes('page=2') && resp.request().method() === 'GET',
    );
    await pagination.getByRole('button', { name: '2', exact: true }).click();
    await page2Response;

    await expect(page).toHaveURL(/page=2/);
    await expect(firstRowNameCell).not.toHaveText(firstRowName!);
  });

  test('page resets to 1 when search query changes', async ({ page }) => {
    const initialResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await initialResponse;

    const pagination = page.locator('.mantine-Pagination-root');
    const page2Response = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.url().includes('page=2') && resp.request().method() === 'GET',
    );
    await pagination.getByRole('button', { name: '2', exact: true }).click();
    await page2Response;

    await expect(page).toHaveURL(/page=2/);

    const searchResponse = waitForSearchSetsResponse(page);
    await page.getByPlaceholder('Search sets...').fill('test');
    await searchResponse;

    await expect(page).not.toHaveURL(/page=2/);
  });

  test('selection resets when changing pages', async ({ page }) => {
    const initialResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await initialResponse;

    const table = page.getByRole('table');
    const firstDataRow = table.getByRole('row').nth(1);
    const firstCheckbox = firstDataRow.getByRole('checkbox');
    await firstCheckbox.check();

    const deleteButton = page.getByRole('button', { name: /Delete/ });
    await expect(deleteButton).toBeEnabled();

    const pagination = page.locator('.mantine-Pagination-root');
    const page2Response = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.url().includes('page=2') && resp.request().method() === 'GET',
    );
    await pagination.getByRole('button', { name: '2', exact: true }).click();
    await page2Response;

    await expect(deleteButton).toBeDisabled();
  });
});
