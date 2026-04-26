import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsByPrefixViaApi,
  generateTestPrefix,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
  waitForStatisticsResponse,
} from './helpers';

test.describe('words statistics sort', () => {
  test('toggles sort by Correct and persists in URL', async ({ page }) => {
    const prefix = generateTestPrefix('stats-sort-correct');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-low`,
        translation: 'low',
        correctCount: 1,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-mid`,
        translation: 'mid',
        correctCount: 3,
        incorrectCount: 0,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-high`,
        translation: 'high',
        correctCount: 5,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: prefix });

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
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });

  test('toggles sort by Incorrect and persists in URL', async ({ page }) => {
    const prefix = generateTestPrefix('stats-sort-incorrect');
    const authToken = await captureAuthToken(page);

    try {
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-weak`,
        translation: 'weak',
        correctCount: 0,
        incorrectCount: 5,
      });
      await seedOpenQuestionAnswersViaApi(page, authToken, {
        word: `${prefix}-strong`,
        translation: 'strong',
        correctCount: 5,
        incorrectCount: 0,
      });

      await openStatisticsPage(page, { searchQuery: prefix });

      const sortResponse = waitForStatisticsResponse(page);
      await page.getByRole('button').filter({ hasText: 'Incorrect' }).click();
      await sortResponse;

      await expect(page).toHaveURL(/sortingFieldName=incorrectCount/);
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });
});
