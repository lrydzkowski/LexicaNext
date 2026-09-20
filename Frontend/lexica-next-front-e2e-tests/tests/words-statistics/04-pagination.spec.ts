import { test, expect } from '@playwright/test';
import { bookWords } from '../words/test-words';
import { captureAuthToken, deleteWordsViaApi, openStatisticsPage, seedOpenQuestionAnswersViaApi } from './helpers';

test.describe('words statistics pagination', () => {
  test('navigates pages via URL and resets to 1 on filter change', async ({ page }) => {
    const authToken = await captureAuthToken(page);
    const wordIds: string[] = [];

    try {
      for (const { word, translation } of bookWords) {
        await seedOpenQuestionAnswersViaApi(page, authToken, wordIds, {
          word,
          translation,
          correctCount: 0,
          incorrectCount: 1,
        });
      }

      await openStatisticsPage(page, { searchQuery: 'book' });

      await page.getByRole('button', { name: '2' }).click();

      await expect(page).toHaveURL(/page=2/);

      await page.getByPlaceholder('Filter words...').fill('bookcase');

      await expect(page).not.toHaveURL(/page=2/);
    } finally {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
  });
});
