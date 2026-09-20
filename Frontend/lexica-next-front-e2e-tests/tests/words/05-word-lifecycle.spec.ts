import { test, expect } from '@playwright/test';
import { captureAuthToken, searchWord, deleteWordsViaApi, waitForSearchResponse } from './helpers';

test.describe('word full lifecycle', () => {
  const wordIds: string[] = [];

  test.afterEach(async ({ page }) => {
    if (wordIds.length > 0) {
      const authToken = await captureAuthToken(page);
      await deleteWordsViaApi(page, wordIds, authToken);
      wordIds.length = 0;
    }
  });

  test('create, verify, edit type, verify, delete, verify', async ({ page }) => {
    const wordName = 'orange';

    await page.goto('/words');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);

    await page.getByLabel('English Word').fill(wordName);
    await page.getByRole('combobox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByPlaceholder('Enter translation...').fill('pomarańczowy');
    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByPlaceholder('Enter example sentence...').fill('This is an orange flower.');
    const createResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/words' && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok(), await createResponse.text()).toBeTruthy();
    const { wordId } = await createResponse.json();
    wordIds.push(wordId);

    await expect(page).toHaveURL(/\/words/);

    await searchWord(page, wordName);

    const wordRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: wordName, exact: true }) });
    await expect(wordRow).toBeVisible();
    await expect(wordRow.getByText('Adjective')).toBeVisible();

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByLabel('English Word')).toHaveValue(wordName);
    await expect(page.getByRole('combobox', { name: 'Word Type' })).toHaveValue('Adjective');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('pomarańczowy');
    await expect(page.getByPlaceholder('Enter example sentence...')).toHaveValue('This is an orange flower.');

    await page.getByRole('combobox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Noun' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const editedRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: wordName, exact: true }) });
    await expect(editedRow.getByText('Noun')).toBeVisible();

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Delete Word' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();
  });
});
