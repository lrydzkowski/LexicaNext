import { test, expect } from '@playwright/test';

const TEST_PREFIX = `e2e-lifecycle-${Date.now()}`;
const WORD_NAME = `${TEST_PREFIX}-transient`;

function waitForSearchResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse((resp) =>
    resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

test.describe.serial('word full lifecycle', () => {
  test('create word with full data', async ({ page }) => {
    await page.goto('/words');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);

    await page.getByLabel('English Word').fill(WORD_NAME);
    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByPlaceholder('Enter translation...').fill('przejsciowy');
    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByPlaceholder('Enter example sentence...').fill('This is a transient state.');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await searchResponse;

    const wordRow = page.getByRole('row').filter({ hasText: WORD_NAME });
    await expect(wordRow).toBeVisible();
    await expect(wordRow.getByText('Adjective')).toBeVisible();
  });

  test('edit word - verify pre-populated data and change type', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByLabel('English Word')).toHaveValue(WORD_NAME);
    await expect(page.getByRole('textbox', { name: 'Word Type' })).toHaveValue('Adjective');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('przejsciowy');
    await expect(page.getByPlaceholder('Enter example sentence...')).toHaveValue('This is a transient state.');

    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Noun' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const postEditSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await postEditSearchResponse;

    const wordRow = page.getByRole('row').filter({ hasText: WORD_NAME });
    await expect(wordRow.getByText('Noun')).toBeVisible();
  });

  test('delete word and verify removal', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}` }).click();
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
