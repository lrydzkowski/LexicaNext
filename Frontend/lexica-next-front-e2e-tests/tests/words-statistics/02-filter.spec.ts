import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsByPrefixViaApi,
  generateTestPrefix,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
} from './helpers';

test.describe('words statistics filter', () => {
  test('typing narrows rows, updates URL and resets page to 1', async ({ page }) => {
    const prefix = generateTestPrefix('stats-filter');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-apple`,
        translation: 'jabłko',
        correctCount: 1,
        incorrectCount: 1,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-pineapple`,
        translation: 'ananas',
        correctCount: 1,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-run`,
        translation: 'biegać',
        correctCount: 1,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { page: '2', searchQuery: prefix });

      await page.getByPlaceholder('Filter words...').fill(`${prefix}-app`);

      await expect(page).toHaveURL(/searchQuery=/);
      await expect(page).not.toHaveURL(/page=2/);
      await expect(page.getByRole('row').filter({ hasText: `${prefix}-apple` })).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: `${prefix}-run` })).toHaveCount(0);
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });

  test('clearing filter restores the full list', async ({ page }) => {
    const prefix = generateTestPrefix('stats-filter-clear');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-alpha`,
        translation: 'alfa',
        correctCount: 1,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-beta`,
        translation: 'beta',
        correctCount: 1,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: prefix });

      await expect(page.getByRole('row').filter({ hasText: prefix })).toHaveCount(2);

      await page.getByPlaceholder('Filter words...').fill(`${prefix}-alpha`);

      await expect(page.getByRole('row').filter({ hasText: `${prefix}-beta` })).toHaveCount(0);

      await page.getByPlaceholder('Filter words...').fill(prefix);

      await expect(page.getByRole('row').filter({ hasText: `${prefix}-beta` })).toHaveCount(1);
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });
});
