import { test, expect } from '@playwright/test';

const TEST_PREFIX = `e2e-edit-${Date.now()}`;
const WORD_NAME = `${TEST_PREFIX}-word`;

function waitForSearchResponse(page: import('@playwright/test').Page) {
  return page.waitForResponse((resp) =>
    resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

test.describe.serial('edit word', () => {
  test('setup - create a word to edit', async ({ page }) => {
    await page.goto('/words/new');
    await page.getByLabel('English Word').fill(WORD_NAME);
    await page.getByPlaceholder('Enter translation...').fill('ulotny');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('cell', { name: WORD_NAME, exact: true })).toBeVisible();
  });

  test('navigates to edit word form with pre-populated data', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page).toHaveURL(/\/words\/.*\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();
    await expect(page.getByLabel('English Word')).toHaveValue(WORD_NAME);
    await expect(page.getByRole('textbox', { name: 'Word Type' })).toHaveValue('Noun');
    await expect(page.getByPlaceholder('Enter translation...')).toHaveValue('ulotny');
  });

  test('edits word text and saves', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(WORD_NAME);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await wordInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await wordInput.pressSequentially(`${WORD_NAME}-updated`);

    const putResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PUT' && response.url().includes('/api/words/'),
    );
    await page.getByRole('button', { name: 'Save' }).click();
    const putResponse = await putResponsePromise;
    const putRequestBody = putResponse.request().postDataJSON();
    expect(putRequestBody.word).toBe(`${WORD_NAME}-updated`);

    await expect(page).toHaveURL(/\/words/);

    await page.goto('/words');
    await expect(page.getByRole('table')).toBeVisible();

    const freshSearchInput = page.getByPlaceholder('Search words...');
    const freshSearchResponse = waitForSearchResponse(page);
    await freshSearchInput.fill(`${WORD_NAME}-updated`);
    await freshSearchResponse;

    await expect(page.getByRole('cell', { name: `${WORD_NAME}-updated`, exact: true })).toBeVisible();
  });

  test('edits word type and saves', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${WORD_NAME}-updated`);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}-updated` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('textbox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: 'Adjective' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const postEditSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${WORD_NAME}-updated`);
    await postEditSearchResponse;

    const wordRow = page.getByRole('row').filter({ hasText: `${WORD_NAME}-updated` });
    await expect(wordRow.getByText('Adjective')).toBeVisible();
  });

  test('adds a translation during edit', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${WORD_NAME}-updated`);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}-updated` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill('efemeryczny');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/words/);
  });

  test('cancel editing preserves original data', async ({ page }) => {
    await page.goto('/words');

    const searchInput = page.getByPlaceholder('Search words...');
    const searchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${WORD_NAME}-updated`);
    await searchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}-updated` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();
    await expect(page).toHaveURL(/\/words\/.*\/edit/);

    const wordInput = page.getByLabel('English Word');
    await wordInput.clear();
    await wordInput.fill('should-not-be-saved');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/words/);
    await expect(page.getByRole('table')).toBeVisible();

    const postCancelSearchResponse = waitForSearchResponse(page);
    await searchInput.fill(`${WORD_NAME}-updated`);
    await postCancelSearchResponse;

    await page.getByRole('button', { name: `Actions for ${WORD_NAME}-updated` }).click();
    await page.getByRole('menuitem', { name: 'Edit Word' }).click();

    await expect(page.getByLabel('English Word')).toHaveValue(`${WORD_NAME}-updated`);
  });

  test('cleanup - delete created word', async ({ page }) => {
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
