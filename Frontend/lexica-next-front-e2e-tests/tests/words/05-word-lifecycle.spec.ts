import { test, expect } from '@playwright/test';
import { generateTestPrefix, searchWord, waitForSearchResponse } from './helpers';

test.describe('word full lifecycle', () => {
  test('create, verify, edit type, verify, delete, verify', async ({ page }) => {
    const prefix = generateTestPrefix('lifecycle');
    const wordName = `${prefix}-transient`;

    await page.goto('/words');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);

    await page.getByLabel('English Word').fill(wordName);
    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByPlaceholder('Enter translation...').fill('przejsciowy');
    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByPlaceholder('Enter example sentence...').fill('This is a transient state.');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);

    await searchWord(page, wordName);

    const wordRow = page.getByRole('row').filter({ hasText: wordName });
    await expect(wordRow).toBeVisible();
    await expect(wordRow.getByText('Adjective')).toBeVisible();

    await page.getByRole('button', { name: `Actions for ${wordName}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByLabel('English Word')).toHaveValue(wordName);
    await expect(page.getByRole('textbox', { name: 'Word Type' })).toHaveValue('Adjective');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('przejsciowy');
    await expect(page.getByPlaceholder('Enter example sentence...')).toHaveValue('This is a transient state.');

    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Noun' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const searchInput = page.getByPlaceholder('Search words...');
    const postEditSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(wordName);
    await postEditSearchResponse;

    const editedRow = page.getByRole('row').filter({ hasText: wordName });
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

