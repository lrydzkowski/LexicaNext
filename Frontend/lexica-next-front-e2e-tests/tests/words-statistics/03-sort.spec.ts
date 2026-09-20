import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsViaApi,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
  waitForStatisticsResponse,
} from './helpers';

test.describe('words statistics sort', () => {
  test('toggles sort by Correct and persists in URL', async ({ page }) => {
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
        correctCount: 3,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'notebook',
        translation: 'zeszyt',
        correctCount: 5,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: 'book' });

      const descSort = waitForStatisticsResponse(page);
      await page.getByRole('button', { name: 'Correct', exact: true }).click();
      await descSort;

      await expect(page).toHaveURL(/sortingFieldName=correctCount/);
      await expect(page).toHaveURL(/sortingOrder=desc/);

      const ascSort = waitForStatisticsResponse(page);
      await page.getByRole('button', { name: 'Correct', exact: true }).click();
      await ascSort;

      await expect(page).toHaveURL(/sortingOrder=asc/);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });

  test('toggles sort by Incorrect and persists in URL', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookcase',
        translation: 'regał',
        correctCount: 0,
        incorrectCount: 5,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
        word: 'bookshop',
        translation: 'księgarnia',
        correctCount: 5,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: 'book' });

      const sortResponse = waitForStatisticsResponse(page);
      await page.getByRole('button').filter({ hasText: 'Incorrect' }).click();
      await sortResponse;

      await expect(page).toHaveURL(/sortingFieldName=incorrectCount/);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });
});
