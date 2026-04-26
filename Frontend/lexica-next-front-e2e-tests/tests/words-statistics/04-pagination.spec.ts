import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  deleteWordsByPrefixViaApi,
  generateTestPrefix,
  openStatisticsPage,
  seedOpenQuestionAnswersViaApi,
} from './helpers';

test.describe('words statistics pagination', () => {
  test('navigates pages via URL and resets to 1 on filter change', async ({ page }) => {
    const prefix = generateTestPrefix('stats-pagination');
    const authToken = await captureAuthToken(page);

    try {
      for (let i = 0; i < 12; i++) {
        await seedOpenQuestionAnswersViaApi(page, authToken, {
          word: `${prefix}-${String.fromCharCode(97 + i)}`,
          translation: `trans-${i}`,
          correctCount: 0,
          incorrectCount: 1,
        });
      }

      await openStatisticsPage(page, { searchQuery: prefix });

      await page.getByRole('button', { name: '2' }).click();

      await expect(page).toHaveURL(/page=2/);

      await page.getByPlaceholder('Filter words...').fill(`${prefix}-a`);

      await expect(page).not.toHaveURL(/page=2/);
    } finally {
      await deleteWordsByPrefixViaApi(page, prefix, authToken);
    }
  });
});
