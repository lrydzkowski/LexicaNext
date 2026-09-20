import { test, expect } from '@playwright/test';
import { captureAuthToken, createWord, searchWord, deleteWordsViaApi, waitForSearchResponse } from './helpers';

test.describe('delete word', () => {
  const wordIds: string[] = [];

  test.afterEach(async ({ page }) => {
    if (wordIds.length > 0) {
      const authToken = await captureAuthToken(page);
      await deleteWordsViaApi(page, wordIds, authToken);
      wordIds.length = 0;
    }
  });

  test('deletes a single word via action menu', async ({ page }) => {
    const wordName = 'bookcase';

    await createWord(page, wordName, 'regał', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Delete Word' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(wordName)).toBeVisible();
    await expect(dialog.getByText('Are you sure you want to delete the following words?')).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();
  });

  test('deletes multiple words via bulk selection', async ({ page }) => {
    await createWord(page, 'bookcase', 'regał', { createdWordIds: wordIds });
    await createWord(page, 'bookshop', 'księgarnia', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, 'book');

    await page.getByRole('checkbox', { name: `Select bookcase` }).check();
    await page.getByRole('checkbox', { name: `Select bookshop` }).check();

    const deleteButton = page.getByRole('button', { name: /Delete \(2\)/ });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('bookcase')).toBeVisible();
    await expect(dialog.getByText('bookshop')).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'bookcase', exact: true })).toHaveCount(0);
    await expect(page.getByRole('cell', { name: 'bookshop', exact: true })).toHaveCount(0);
  });

  test('cancel deletion keeps the word', async ({ page }) => {
    const wordName = 'bookcase';

    await createWord(page, wordName, 'regał', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Delete Word' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: wordName, exact: true })).toBeVisible();
  });
});
