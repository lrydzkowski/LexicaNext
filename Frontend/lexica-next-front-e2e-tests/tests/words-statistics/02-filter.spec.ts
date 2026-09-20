import { test, expect } from '@playwright/test';
import { captureAuthToken, deleteWordsViaApi, openStatisticsPage, seedOpenQuestionAnswersViaApi } from './helpers';

test.describe('words statistics filter', () => {
  test('typing narrows rows, updates URL and resets page to 1', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookcase',
        translation: 'regał',
        correctCount: 1,
        incorrectCount: 1,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookshop',
        translation: 'księgarnia',
        correctCount: 1,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'notebook',
        translation: 'zeszyt',
        correctCount: 1,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { page: '2', searchQuery: 'book' });

      await page.getByPlaceholder('Filter words...').fill('bookc');

      await expect(page).toHaveURL(/searchQuery=/);
      await expect(page).not.toHaveURL(/page=2/);
      await expect(
        page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) }),
      ).toBeVisible();
      await expect(
        page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'notebook', exact: true }) }),
      ).toHaveCount(0);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });

  test('clearing filter restores the full list', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookcase',
        translation: 'regał',
        correctCount: 1,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookshop',
        translation: 'księgarnia',
        correctCount: 1,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: 'book' });

      await expect(
        page.getByRole('row').filter({ has: page.getByRole('cell', { name: /^(bookcase|bookshop)$/ }) }),
      ).toHaveCount(2);

      await page.getByPlaceholder('Filter words...').fill('bookcase');

      await expect(
        page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) }),
      ).toHaveCount(0);

      await page.getByPlaceholder('Filter words...').fill('');

      await expect(
        page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) }),
      ).toHaveCount(1);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });
});
