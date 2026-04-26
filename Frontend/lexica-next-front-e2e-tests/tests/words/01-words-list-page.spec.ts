import { test, expect } from '@playwright/test';
import { waitForSearchResponse, waitForWordsResponse } from './helpers';

test.describe('words list page', () => {
  test('navigates to words list from header', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Words', exact: true }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByText('Words').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create New Word' })).toBeVisible();
    await expect(page.getByPlaceholder('Search words...')).toBeVisible();
  });

  test('renders words table with correct columns', async ({ page }) => {
    await page.goto('/words');

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Word', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Word Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Edited' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Select all words' })).toBeVisible();
  });

  test('search filters words and clearing restores list', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const initialRowCount = await page.getByRole('row').count();

    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill('zzz_nonexistent_word_zzz');
    await searchResponse;

    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();

    const clearResponse = waitForWordsResponse(page);
    await searchInput.clear();
    await clearResponse;

    const restoredRowCount = await page.getByRole('row').count();
    expect(restoredRowCount).toBeGreaterThanOrEqual(initialRowCount);
  });
});
