import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  deleteWordsViaApi,
  deleteSetViaApi,
  getSetIdByName,
  waitForSetsResponse,
  searchSet,
} from './helpers';

test.describe('create set', () => {
  const setIdsToClean: string[] = [];
  const setNamesToClean: string[] = [];
  const wordIdsToClean: string[] = [];
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    for (const name of setNamesToClean) {
      try {
        const id = await getSetIdByName(page, name, authToken);
        setIdsToClean.push(id);
      } catch {}
    }
    if (setIdsToClean.length > 0) {
      await deleteSetViaApi(page, setIdsToClean, authToken);
    }
    if (wordIdsToClean.length > 0) {
      await deleteWordsViaApi(page, wordIdsToClean, authToken);
    }
    await page.close();
    await context.close();
  });

  test('navigates to create set form and shows auto-populated set name', async ({ page }) => {
    await page.goto('/sets/new');

    await expect(page).toHaveURL(/\/sets\/new/);
    await expect(page.getByRole('heading', { name: 'Create New Set' })).toBeVisible();

    const setNameInput = page.getByLabel('Set Name');
    await expect(setNameInput).toBeVisible();
    await expect(setNameInput).toBeDisabled();
    await expect(setNameInput).not.toHaveValue('');

    await expect(page.getByRole('button', { name: 'Add Words' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Words' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Create New Word' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(
      page.getByText('No words selected. Click "Add Words" to select words from your library.'),
    ).toBeVisible();
    await expect(page.getByText('Selected Words (0)')).toBeVisible();
  });

  test('creates a set by selecting existing words via Add Words modal', async ({ page }) => {
    const prefix = generateTestPrefix('create-set');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIdsToClean.push(wordAId, wordBId);

    await page.goto('/sets/new');

    const setNameInput = page.getByLabel('Set Name');
    await expect(setNameInput).not.toHaveValue('');
    const setName = await setNameInput.inputValue();
    setNamesToClean.push(setName);

    await page.getByRole('button', { name: 'Add Words' }).click();

    await expect(page.getByRole('heading', { name: 'Select Words' })).toBeVisible();
    await expect(page.getByPlaceholder('Search words...')).toBeVisible();

    const modalSearchInput = page.getByPlaceholder('Search words...');
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(prefix);
    await wordsSearchResponse;

    const wordARow = page.getByRole('row').filter({ hasText: `${prefix}-word-a` });
    const wordBRow = page.getByRole('row').filter({ hasText: `${prefix}-word-b` });
    await expect(wordARow).toBeVisible();
    await expect(wordBRow).toBeVisible();

    await wordARow.click();
    await wordBRow.click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: `${prefix}-word-a` })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: `${prefix}-word-b` })).toBeVisible();

    const postResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await postResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await searchSet(page, setName);
    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();
  });

  test('validation - cannot save set with no words selected', async ({ page }) => {
    await page.goto('/sets/new');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Please select at least one word for the set')).toBeVisible();
    await expect(page).toHaveURL(/\/sets\/new/);
  });

  test('cancel set creation navigates back to sets list', async ({ page }) => {
    await page.goto('/sets/new');

    await expect(page.getByRole('heading', { name: 'Create New Set' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('creates a word inline via Create New Word modal and it auto-adds to selected words', async ({ page }) => {
    const prefix = generateTestPrefix('create-inline');
    const inlineWordName = `${prefix}-inline-word`;

    await page.goto('/sets/new');

    const inlineSetName = await page.getByLabel('Set Name').inputValue();
    setNamesToClean.push(inlineSetName);

    await page.getByRole('button', { name: 'Create New Word' }).click();

    await expect(page.getByRole('heading', { name: 'Create New Word' })).toBeVisible();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('English Word').fill(inlineWordName);
    await dialog.getByPlaceholder('Enter translation...').first().fill('test-translation');

    const wordPostResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/words') && resp.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Save' }).click();
    const wordPostResponse = await wordPostResponsePromise;
    const wordBody = await wordPostResponse.json();
    wordIdsToClean.push(wordBody.wordId);

    await expect(dialog).not.toBeVisible();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: inlineWordName })).toBeVisible();

    const setPostResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await setPostResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('removes a selected word from the set form using the trash icon', async ({ page }) => {
    const prefix = generateTestPrefix('create-remove');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIdsToClean.push(wordAId, wordBId);

    await page.goto('/sets/new');
    await page.getByRole('button', { name: 'Add Words' }).click();

    const modalSearchInput = page.getByPlaceholder('Search words...');
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(prefix);
    await wordsSearchResponse;

    await page
      .getByRole('row')
      .filter({ hasText: `${prefix}-word-a` })
      .click();
    await page
      .getByRole('row')
      .filter({ hasText: `${prefix}-word-b` })
      .click();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Remove word' }).first().click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
  });

  test('back arrow navigates to sets list', async ({ page }) => {
    await page.goto('/sets/new');

    await expect(page.getByRole('heading', { name: 'Create New Set' })).toBeVisible();

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });
});
