import { test, expect } from '@playwright/test';

const TEST_PREFIX = `e2e-page-${Date.now()}`;
const WORD_COUNT = 11;

function waitForWordsResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse((resp) =>
    resp.url().includes('/api/words') && resp.request().method() === 'GET',
  );
}

function waitForSearchResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse((resp) =>
    resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

test.describe.serial('words pagination', () => {
  test('setup - create enough words to trigger pagination', async ({ page }) => {
    for (let i = 1; i <= WORD_COUNT; i++) {
      await page.goto('/words/new');
      await page.getByLabel('English Word').fill(`${TEST_PREFIX}-${String(i).padStart(2, '0')}`);
      await page.getByPlaceholder('Enter translation...').fill(`tlumaczenie-${i}`);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page).toHaveURL(/\/words(\?|$)/);
    }
  });

  test('pagination controls appear when enough words exist', async ({ page }) => {
    const wordsResponsePromise = waitForWordsResponse(page);
    await page.goto('/words');
    await wordsResponsePromise;

    await expect(page.getByRole('table')).toBeVisible();

    const pagination = page.locator('.mantine-Pagination-root');
    await expect(pagination).toBeVisible();

    const tableBodyRows = page.getByRole('table').getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
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
    const page2Response = page.waitForResponse((resp) =>
      resp.url().includes('/api/words') && resp.url().includes('page=2') && resp.request().method() === 'GET',
    );
    await pagination.getByRole('button', { name: '2', exact: true }).click();
    await page2Response;

    await expect(page).toHaveURL(/page=2/);
    await expect(firstRowWordCell).not.toHaveText(firstRowWord!);
  });

  test('cleanup - delete all pagination test words', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(TEST_PREFIX);
    await searchResponse;

    let hasWords = true;
    while (hasWords) {
      const rows = page.getByRole('row').filter({ has: page.getByText(TEST_PREFIX) });
      const rowCount = await rows.count();

      if (rowCount === 0) {
        hasWords = false;
        break;
      }

      const deleteRefetch = waitForSearchResponse(page);
      await page.getByRole('checkbox', { name: 'Select all words' }).check();
      await page.getByRole('button', { name: /Delete/ }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await deleteRefetch;
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});
