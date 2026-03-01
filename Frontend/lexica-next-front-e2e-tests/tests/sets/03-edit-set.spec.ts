import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  searchSet,
  navigateToSetAction,
  getSetNameFromProposedName,
  waitForSetsResponse,
} from './helpers';

test.describe('edit set', () => {
  const setIds: string[] = [];
  const wordIds: string[] = [];
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
    if (setIds.length > 0) {
      await deleteSetViaApi(page, setIds, authToken);
    }
    if (wordIds.length > 0) {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
    await page.close();
    await context.close();
  });

  test('navigates to edit set form with pre-populated data', async ({ page }) => {
    const prefix = generateTestPrefix('edit-nav');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordId], authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page).toHaveURL(/\/sets\/.*\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Set' })).toBeVisible();

    const setNameInput = page.getByLabel('Set Name');
    await expect(setNameInput).toHaveValue(setName);
    await expect(setNameInput).toBeDisabled();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: `${prefix}-word` })).toBeVisible();
  });

  test('adds a new word to an existing set', async ({ page }) => {
    const prefix = generateTestPrefix('edit-add');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIds.push(wordAId, wordBId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordAId], authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    await page.getByRole('button', { name: 'Add Words' }).click();

    const modalSearchInput = page.getByPlaceholder('Search words...');
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(`${prefix}-word-b`);
    await wordsSearchResponse;

    await page
      .getByRole('row')
      .filter({ hasText: `${prefix}-word-b` })
      .click();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('removes a word from an existing set', async ({ page }) => {
    const prefix = generateTestPrefix('edit-rm');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIds.push(wordAId, wordBId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordAId, wordBId], authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Remove word' }).first().click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('cancel editing preserves original set data', async ({ page }) => {
    const prefix = generateTestPrefix('edit-cancel');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIds.push(wordAId, wordBId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordAId], authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await page.getByRole('button', { name: 'Add Words' }).click();

    const modalSearchInput = page.getByPlaceholder('Search words...');
    await modalSearchInput.fill(`${prefix}-word-b`);
    const wordBRow = page.getByRole('row').filter({ hasText: `${prefix}-word-b` });
    await expect(wordBRow).toBeVisible();
    await wordBRow.click();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
  });

  test('already-selected words are highlighted in the Select Words modal', async ({ page }) => {
    const prefix = generateTestPrefix('edit-highlight');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordId], authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await page.getByRole('button', { name: 'Add Words' }).click();

    const dialog = page.getByRole('dialog');
    const modalSearchInput = dialog.getByPlaceholder('Search words...');
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(`${prefix}-word`);
    await wordsSearchResponse;

    const wordRow = dialog.getByRole('row').filter({ hasText: `${prefix}-word` });
    await expect(wordRow).toBeVisible();

    const checkbox = wordRow.getByRole('checkbox');
    await expect(checkbox).toBeChecked();
  });
});
