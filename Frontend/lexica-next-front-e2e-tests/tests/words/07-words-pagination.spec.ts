import { test, expect } from '@playwright/test';
import { generateTestPrefix, createWord, deleteWordsByPrefix, waitForWordsResponse } from './helpers';

const WORD_COUNT = 11;

test.describe('words pagination', () => {
  test('pagination controls appear when enough words exist', async ({ page }) => {
    const prefix = generateTestPrefix('page-ctrl');

    for (let i = 1; i <= WORD_COUNT; i++) {
      await createWord(page, `${prefix}-${String(i).padStart(2, '0')}`, `tlumaczenie-${i}`);
    }

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

    await deleteWordsByPrefix(page, prefix);
  });

  test('navigates to next page', async ({ page }) => {
    const prefix = generateTestPrefix('page-nav');

    for (let i = 1; i <= WORD_COUNT; i++) {
      await createWord(page, `${prefix}-${String(i).padStart(2, '0')}`, `tlumaczenie-${i}`);
    }

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

    await deleteWordsByPrefix(page, prefix);
  });
});

