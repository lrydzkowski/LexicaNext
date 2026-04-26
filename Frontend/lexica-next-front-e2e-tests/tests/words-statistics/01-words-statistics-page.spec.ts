import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsByPrefixViaApi,
  generateTestPrefix,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
} from './helpers';

test.describe('words statistics page', () => {
  test('navigates from header and renders columns', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Words Statistics' }).click();

    await expect(page).toHaveURL(/\/words-statistics/);
    await expect(page.getByRole('heading', { name: 'Words Statistics' })).toBeVisible();
    await expect(page.getByPlaceholder('Filter words...')).toBeVisible();
  });

  test('renders seeded rows with correct counts', async ({ page }) => {
    const prefix = generateTestPrefix('stats-baseline');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-apple`,
        translation: 'jabłko',
        correctCount: 3,
        incorrectCount: 1,
      });

      await openStatisticsPage(page, { searchQuery: prefix });

      const row = page.getByRole('row').filter({ hasText: `${prefix}-apple` });
      await expect(row).toBeVisible();
      await expect(row.getByText('3', { exact: true })).toBeVisible();
      await expect(row.getByText('1', { exact: true })).toBeVisible();
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });

  test('shows filtered empty state when no rows match', async ({ page }) => {
    await openStatisticsPage(page, { searchQuery: 'zzz_nonexistent_word_zzz' });
    await expect(page.getByRole('cell', { name: 'No words match your filter.' })).toBeVisible();
  });
});
