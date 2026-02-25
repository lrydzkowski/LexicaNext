import { test, expect } from '@playwright/test';

const TEST_PREFIX = `e2e-delete-${Date.now()}`;

function waitForSearchResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse((resp) =>
    resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

test.describe.serial('delete word', () => {
  test('setup - create words for deletion tests', async ({ page }) => {
    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(`${TEST_PREFIX}-single`);
    await page.getByPlaceholder('Enter translation...').fill('tymczasowy');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/words/);

    await page.getByRole('link', { name: 'Create New Word' }).click();
    await page.getByLabel('English Word').fill(`${TEST_PREFIX}-bulk-a`);
    await page.getByPlaceholder('Enter translation...').fill('masowy-a');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/words/);

    await page.getByRole('link', { name: 'Create New Word' }).click();
    await page.getByLabel('English Word').fill(`${TEST_PREFIX}-bulk-b`);
    await page.getByPlaceholder('Enter translation...').fill('masowy-b');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/words/);

    await page.getByRole('link', { name: 'Create New Word' }).click();
    await page.getByLabel('English Word').fill(`${TEST_PREFIX}-cancel`);
    await page.getByPlaceholder('Enter translation...').fill('anulowany');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/words/);
  });

  test('deletes a single word via action menu', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${TEST_PREFIX}-single`);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${TEST_PREFIX}-single` }).click();
    await page.getByRole('menuitem', { name: 'Delete Word' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(`${TEST_PREFIX}-single`)).toBeVisible();
    await expect(dialog.getByText('Are you sure you want to delete the following words?')).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();
  });

  test('deletes multiple words via bulk selection', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${TEST_PREFIX}-bulk`);
    await searchResponse;

    await page.getByRole('checkbox', { name: `Select ${TEST_PREFIX}-bulk-a` }).check();
    await page.getByRole('checkbox', { name: `Select ${TEST_PREFIX}-bulk-b` }).check();

    const deleteButton = page.getByRole('button', { name: /Delete \(2\)/ });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(`${TEST_PREFIX}-bulk-a`)).toBeVisible();
    await expect(dialog.getByText(`${TEST_PREFIX}-bulk-b`)).toBeVisible();

    const postDeleteRefetch = waitForSearchResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No words found matching your search.' })).toBeVisible();
  });

  test('cancel deletion keeps the word', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${TEST_PREFIX}-cancel`);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${TEST_PREFIX}-cancel` }).click();
    await page.getByRole('menuitem', { name: 'Delete Word' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: `${TEST_PREFIX}-cancel`, exact: true })).toBeVisible();
  });

  test('cleanup - delete remaining test words', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
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
