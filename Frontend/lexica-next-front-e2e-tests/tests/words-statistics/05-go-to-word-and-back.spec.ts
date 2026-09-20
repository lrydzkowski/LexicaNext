import { test, expect } from '@playwright/test';
import { captureAuthToken, deleteWordsViaApi, openStatisticsPage, seedOpenQuestionAnswersViaApi } from './helpers';

test.describe('words statistics go-to-word and back', () => {
  test('carries filter/sort/page as returnTo and restores them on back', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookcase',
        translation: 'regał',
        correctCount: 2,
        incorrectCount: 3,
      });

      await openStatisticsPage(page, {
        searchQuery: 'book',
        sortingFieldName: 'correctCount',
        sortingOrder: 'desc',
      });

      const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) });
      await expect(row).toBeVisible();

      await row.getByRole('link', { name: /Edit/ }).click();

      await expect(page).toHaveURL(/\/words\/[^/]+\/edit/);
      await expect(page).toHaveURL(/returnTo=/);

      await page.getByRole('button', { name: 'Go back' }).click();

      await expect(page).toHaveURL(/\/words-statistics/);
      await expect(page).toHaveURL(new RegExp(`searchQuery=${encodeURIComponent('book')}`));
      await expect(page).toHaveURL(/sortingFieldName=correctCount/);
      await expect(page).toHaveURL(/sortingOrder=desc/);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });

  test('existing Words page back behavior still works', async ({ page }) => {
    await page.goto('/words?page=1');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);

    await page
      .getByRole('button', { name: 'Go back' })
      .click()
      .catch(async () => {
        await page.goBack();
      });

    await expect(page).toHaveURL(/\/words/);
  });
});
