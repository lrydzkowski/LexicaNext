import { test, expect } from '@playwright/test';
import {
  cleanupCreatedData,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  navigateToSetAction,
  getSetNameById,
} from './helpers';

test.describe('edit set', () => {
  let authToken: string;
  const testWordIds: string[] = [];
  const testSetIds: string[] = [];

  test.afterEach(async ({ page }) => {
    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  test('navigates to edit set form with pre-populated data', async ({ page }) => {
    const wordId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page).toHaveURL(/\/sets\/.*\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Set' })).toBeVisible();

    const setNameInput = page.getByLabel('Set Name');
    await expect(setNameInput).toHaveValue(setName);
    await expect(setNameInput).toBeDisabled();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) }),
    ).toBeVisible();
  });

  test('adds a new word to an existing set', async ({ page }) => {
    const wordAId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordAId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    await page.getByRole('button', { name: 'Add Words' }).click();

    const addWordsDialog = page.getByRole('dialog');
    await expect(addWordsDialog).toBeVisible();
    const modalSearchInput = addWordsDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill('bookshop');
    await wordsSearchResponse;

    await addWordsDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) })
      .click();
    await addWordsDialog.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('removes a word from an existing set', async ({ page }) => {
    const wordAId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    const wordBId = await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordAId, wordBId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Remove word' }).first().click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('cancel editing preserves original set data', async ({ page }) => {
    const wordAId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordAId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await page.getByRole('button', { name: 'Add Words' }).click();

    const cancelDialog = page.getByRole('dialog');
    await expect(cancelDialog).toBeVisible();
    const modalSearchInput = cancelDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    await modalSearchInput.fill('bookshop');
    const wordBRow = cancelDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) });
    await expect(wordBRow).toBeVisible();
    await wordBRow.click();
    await cancelDialog.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
  });

  test('Save (without close) stays on edit form and persists changes', async ({ page }) => {
    const wordAId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'notebook', 'zeszyt', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordAId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    await page.getByRole('button', { name: 'Add Words' }).click();
    const addDialog1 = page.getByRole('dialog');
    await expect(addDialog1).toBeVisible();
    const search1 = addDialog1.getByPlaceholder('Search words...');
    await search1.click();
    const searchResp1 = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await search1.fill('bookshop');
    await searchResp1;
    await addDialog1
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) })
      .click();
    await addDialog1.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    const putResponse1 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/sets/${setId}`) && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await putResponse1;

    await expect(page).toHaveURL(new RegExp(`/sets/${setId}/edit`));
    await expect(page.getByRole('heading', { name: 'Edit Set' })).toBeVisible();
    await expect(page.getByText('Set saved')).toBeVisible();
    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Add Words' }).click();
    const addDialog2 = page.getByRole('dialog');
    await expect(addDialog2).toBeVisible();
    const search2 = addDialog2.getByPlaceholder('Search words...');
    await search2.click();
    const searchResp2 = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await search2.fill('notebook');
    await searchResp2;
    await addDialog2
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'notebook', exact: true }) })
      .click();
    await addDialog2.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (3)')).toBeVisible();

    const putResponse2 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/sets/${setId}`) && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await putResponse2;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('already-selected words are highlighted in the Select Words modal', async ({ page }) => {
    const wordId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await page.getByRole('button', { name: 'Add Words' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const modalSearchInput = dialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill('bookcase');
    await wordsSearchResponse;

    const wordRow = dialog.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) });
    await expect(wordRow).toBeVisible();

    const checkbox = wordRow.getByRole('checkbox');
    await expect(checkbox).toBeChecked();
  });
});
