import { test, expect } from '@playwright/test';
import { generateTestPrefix, createWord, searchWord, deleteWordsByPrefix, waitForSearchResponse } from './helpers';

test.describe('edit word', () => {
  test('navigates to edit word form with pre-populated data', async ({ page }) => {
    const prefix = generateTestPrefix('edit-nav');
    const wordName = `${prefix}-word`;

    await createWord(page, wordName, 'ulotny');

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();
    await expect(page.getByLabel('English Word')).toHaveValue(wordName);
    await expect(page.getByRole('textbox', { name: 'Word Type' })).toHaveValue('Noun');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('ulotny');

    await deleteWordsByPrefix(page, prefix);
  });

  test('edits word text and saves', async ({ page }) => {
    const prefix = generateTestPrefix('edit-text');
    const wordName = `${prefix}-word`;

    await createWord(page, wordName, 'ulotny');

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await wordInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await wordInput.pressSequentially(`${wordName}-updated`);

    const putResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PUT' && response.url().includes('/api/words/'),
    );
    await page.getByRole('button', { name: 'Save' }).click();
    const putResponse = await putResponsePromise;
    const putRequestBody = putResponse.request().postDataJSON();
    expect(putRequestBody.word).toBe(`${wordName}-updated`);

    await expect(page).toHaveURL(/\/words/);

    await page.goto('/words');
    await expect(page.getByRole('table')).toBeVisible();

    const freshSearchResponse = waitForSearchResponse(page);
    await page.getByPlaceholder('Search words...').fill(`${wordName}-updated`);
    await freshSearchResponse;

    await expect(page.getByRole('cell', { name: `${wordName}-updated`, exact: true })).toBeVisible();

    await deleteWordsByPrefix(page, prefix);
  });

  test('edits word type and saves', async ({ page }) => {
    const prefix = generateTestPrefix('edit-type');
    const wordName = `${prefix}-word`;

    await createWord(page, wordName, 'ulotny');

    await page.goto('/words');
    const searchInput = page.getByPlaceholder('Search words...');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const postEditSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(wordName);
    await postEditSearchResponse;

    const wordRow = page.getByRole('row').filter({ hasText: wordName });
    await expect(wordRow.getByText('Adjective')).toBeVisible();

    await deleteWordsByPrefix(page, prefix);
  });

  test('adds a translation during edit', async ({ page }) => {
    const prefix = generateTestPrefix('edit-trans');
    const wordName = `${prefix}-word`;

    await createWord(page, wordName, 'ulotny');

    await page.goto('/words');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill('efemeryczny');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);

    await deleteWordsByPrefix(page, prefix);
  });

  test('cancel editing preserves original data', async ({ page }) => {
    const prefix = generateTestPrefix('edit-cancel');
    const wordName = `${prefix}-word`;

    await createWord(page, wordName, 'ulotny');

    await page.goto('/words');
    const searchInput = page.getByPlaceholder('Search words...');
    await searchWord(page, wordName);

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await wordInput.clear();
    await wordInput.fill('should-not-be-saved');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const postCancelSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(wordName);
    await postCancelSearchResponse;

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page.getByLabel('English Word')).toHaveValue(wordName);

    await deleteWordsByPrefix(page, prefix);
  });
});

