import { test, expect } from '@playwright/test';
import { captureAuthToken, deleteWordsViaApi, openStatisticsPage, seedOpenQuestionAnswersViaApi } from './helpers';

test.describe('words statistics page', () => {
  test('navigates from header and renders columns', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Words Statistics' }).click();

    await expect(page).toHaveURL(/\/words-statistics/);
    await expect(page.getByRole('heading', { name: 'Words Statistics' })).toBeVisible();
    await expect(page.getByPlaceholder('Filter words...')).toBeVisible();
  });

  test('renders seeded rows with correct counts', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookcase',
        translation: 'regał',
        correctCount: 3,
        incorrectCount: 1,
      });

      await openStatisticsPage(page, { searchQuery: 'book' });

      const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) });
      await expect(row).toBeVisible();
      await expect(row.getByText('3', { exact: true })).toBeVisible();
      await expect(row.getByText('1', { exact: true })).toBeVisible();
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });

  test('shows filtered empty state when no rows match', async ({ page }) => {
    await openStatisticsPage(page, { searchQuery: 'zzz_nonexistent_word_zzz' });
    await expect(page.getByRole('cell', { name: 'No words match your filter.' })).toBeVisible();
  });
});
