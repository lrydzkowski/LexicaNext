import { test, expect } from '@playwright/test';

const TEST_PREFIX = `e2e-create-${Date.now()}`;

test.describe.serial('create word', () => {
  test('navigates to create word form', async ({ page }) => {
    await page.goto('/words');
    await page.getByRole('link', { name: 'Create New Word' }).click();

    await expect(page).toHaveURL(/\/words\/new/);
    await expect(page.getByRole('heading', { name: 'Create New Word' })).toBeVisible();
    await expect(page.getByLabel('English Word')).toBeFocused();
    await expect(page.getByRole('textbox', { name: 'Word Type' })).toHaveValue('Noun');
    await expect(page.getByPlaceholder('Enter translation...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  test('creates a word with minimal data', async ({ page }) => {
    const wordName = `${TEST_PREFIX}-minimal`;

    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(wordName);
    await page.getByPlaceholder('Enter translation...').fill('ulotny');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('cell', { name: wordName, exact: true })).toBeVisible();
  });

  test('creates a word with full data', async ({ page }) => {
    const wordName = `${TEST_PREFIX}-full`;

    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(wordName);
    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByPlaceholder('Enter translation...').first().fill('drobiazgowy');
    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill('skrupulatny');
    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByPlaceholder('Enter example sentence...').fill('She is meticulous about her work.');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('cell', { name: wordName, exact: true })).toBeVisible();
  });

  test('validation - empty word field', async ({ page }) => {
    await page.goto('/words/new');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Word is required')).toBeVisible();
    await expect(page).toHaveURL(/\/words\/new/);
  });

  test('validation - empty translation field', async ({ page }) => {
    await page.goto('/words/new');
    await page.getByLabel('English Word').fill('pristine');
    await page.getByPlaceholder('Enter translation...').clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Translation is required')).toBeVisible();
    await expect(page).toHaveURL(/\/words\/new/);
  });

  test('cancel word creation', async ({ page }) => {
    const wordName = `${TEST_PREFIX}-cancelled`;

    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(wordName);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('cell', { name: wordName, exact: true })).not.toBeVisible();
  });

  test('cleanup - delete created words', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = page.waitForResponse((resp) =>
      resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await searchInput.fill(TEST_PREFIX);
    await searchResponse;

    const rows = page.getByRole('row').filter({ has: page.getByText(TEST_PREFIX) });
    const rowCount = await rows.count();

    if (rowCount === 0) {
      return;
    }

    await page.getByRole('checkbox', { name: 'Select all words' }).check();
    await page.getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
