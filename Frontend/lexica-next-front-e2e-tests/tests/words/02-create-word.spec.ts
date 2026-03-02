import { test, expect } from '@playwright/test';
import { generateTestPrefix, createWord, deleteWordsByPrefix } from './helpers';

test.describe('create word', () => {
  const prefixes: string[] = [];

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    for (const prefix of prefixes) {
      await deleteWordsByPrefix(page, prefix);
    }
    await page.close();
    await context.close();
  });

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
    const prefix = generateTestPrefix('create-min');
    prefixes.push(prefix);
    const wordName = `${prefix}-minimal`;

    await createWord(page, wordName, 'ulotny');
    await expect(page.getByRole('cell', { name: wordName, exact: true })).toBeVisible();
  });

  test('creates a word with full data', async ({ page }) => {
    const prefix = generateTestPrefix('create-full');
    prefixes.push(prefix);
    const wordName = `${prefix}-full`;

    await createWord(page, wordName, 'drobiazgowy', {
      type: 'Adjective',
      secondTranslation: 'skrupulatny',
      sentence: 'She is meticulous about her work.',
    });
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
    const prefix = generateTestPrefix('create-cancel');
    const wordName = `${prefix}-cancelled`;

    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(wordName);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('cell', { name: wordName, exact: true })).not.toBeVisible();
  });
});
