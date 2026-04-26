import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsByPrefixViaApi,
  generateTestPrefix,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
} from './helpers';

test.describe('words statistics go-to-word and back', () => {
  test('carries filter/sort/page as returnTo and restores them on back', async ({ page }) => {
    const prefix = generateTestPrefix('stats-return');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-apple`,
        translation: 'jabłko',
        correctCount: 2,
        incorrectCount: 3,
      });

      await openStatisticsPage(page, {
        searchQuery: prefix,
        sortingFieldName: 'correctCount',
        sortingOrder: 'desc',
      });

      const row = page.getByRole('row').filter({ hasText: `${prefix}-apple` });
      await expect(row).toBeVisible();

      await row.getByRole('link', { name: /Edit/ }).click();

      await expect(page).toHaveURL(/\/words\/[^/]+\/edit/);
      await expect(page).toHaveURL(/returnTo=/);

      await page.getByRole('button', { name: 'Go back' }).click();

      await expect(page).toHaveURL(/\/words-statistics/);
      await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent(prefix)}`));
      await expect(page).toHaveURL(/sortingFieldName=correctCount/);
      await expect(page).toHaveURL(/sortingOrder=desc/);
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });

  test('existing Words page back behavior still works', async ({ page }) => {
    await page.goto('/words?page=1');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);

    await page.getByRole('button', { name: 'Go back' }).click().catch(async () => {
      await page.goBack();
    });

    await expect(page).toHaveURL(/\/words/);
  });
});
