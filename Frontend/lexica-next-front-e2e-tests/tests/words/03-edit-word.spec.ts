import { test, expect } from '@playwright/test';
import { captureAuthToken, createWord, searchWord, deleteWordsViaApi, waitForSearchResponse } from './helpers';

test.describe('edit word', () => {
  const wordIds: string[] = [];

  test.afterEach(async ({ page }) => {
    if (wordIds.length > 0) {
      const authToken = await captureAuthToken(page);
      await deleteWordsViaApi(page, wordIds, authToken);
      wordIds.length = 0;
    }
  });

  test('navigates to edit word form with pre-populated data', async ({ page }) => {
    const wordName = 'orange';

    await createWord(page, wordName, 'pomarańcza', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();
    await expect(page.getByLabel('English Word')).toHaveValue(wordName);
    await expect(page.getByRole('combobox', { name: 'Word Type' })).toHaveValue('Noun');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('pomarańcza');
  });

  test('edits word text and saves', async ({ page }) => {
    const wordName = 'orange';

    await createWord(page, wordName, 'pomarańcza', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await expect(wordInput).toHaveValue(wordName);
    await wordInput.clear();
    await wordInput.fill('notebook');

    const putResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PUT' && response.url().includes('/api/words/'),
    );
    await page.getByRole('button', { name: 'Save' }).click();
    const putResponse = await putResponsePromise;
    const putRequestBody = putResponse.request().postDataJSON();
    expect(putRequestBody.word).toBe('notebook');

    await expect(page).toHaveURL(/\/words/);

    await page.goto('/words');
    await expect(page.getByRole('table')).toBeVisible();

    const freshSearchResponse = waitForSearchResponse(page);
    await page.getByPlaceholder('Search words...').fill('notebook');
    await freshSearchResponse;

    await expect(page.getByRole('cell', { name: 'notebook', exact: true })).toBeVisible();
  });

  test('edits word type and saves', async ({ page }) => {
    const wordName = 'orange';

    await createWord(page, wordName, 'pomarańcza', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('combobox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const wordRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: wordName, exact: true }) });
    await expect(wordRow.getByText('Adjective')).toBeVisible();
  });

  test('adds a translation during edit', async ({ page }) => {
    const wordName = 'orange';

    await createWord(page, wordName, 'pomarańcza', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill('pomarańczowy');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
  });

  test('cancel editing preserves original data', async ({ page }) => {
    const wordName = 'orange';

    await createWord(page, wordName, 'pomarańcza', { createdWordIds: wordIds });

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await expect(wordInput).toHaveValue(wordName);
    await wordInput.clear();
    await wordInput.fill('pear');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page.getByLabel('English Word')).toHaveValue(wordName);
  });
});
