import { test, expect } from '@playwright/test';
import { generateTestPrefix, createWord, searchWord, deleteWordsByPrefix, waitForSearchResponse } from './helpers';

test.describe('delete word', () => {
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

  test('deletes a single word via action menu', async ({ page }) => {
    const prefix = generateTestPrefix('del-single');
    prefixes.push(prefix);
    const wordName = `${prefix}-single`;

    await createWord(page, wordName, 'tymczasowy');

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
    const prefix = generateTestPrefix('del-bulk');
    prefixes.push(prefix);

    await createWord(page, `${prefix}-bulk-a`, 'masowy-a');
    await createWord(page, `${prefix}-bulk-b`, 'masowy-b');

    await page.goto('/words');
    await searchWord(page, `${prefix}-bulk`);

    await page.getByRole('checkbox', { name: `Select ${prefix}-bulk-a` }).check();
    await page.getByRole('checkbox', { name: `Select ${prefix}-bulk-b` }).check();

    const deleteButton = page.getByRole('button', { name: /Delete \(2\)/ });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(`${prefix}-bulk-a`)).toBeVisible();
    await expect(dialog.getByText(`${prefix}-bulk-b`)).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();
  });

  test('cancel deletion keeps the word', async ({ page }) => {
    const prefix = generateTestPrefix('del-cancel');
    prefixes.push(prefix);
    const wordName = `${prefix}-cancel`;

    await createWord(page, wordName, 'anulowany');

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
