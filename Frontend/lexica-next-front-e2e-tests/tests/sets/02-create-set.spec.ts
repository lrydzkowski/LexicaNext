import { test, expect } from '@playwright/test';
import { cleanupCreatedData, captureAuthToken, createWordViaApiReturningId, searchSet } from './helpers';

test.describe('create set', () => {
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
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save and Close' })).toBeVisible();
    await expect(
      page.getByText('No words selected. Click "Add Words" to select words from your library.'),
    ).toBeVisible();
    await expect(page.getByText('Selected Words (0)')).toBeVisible();
  });

  test('creates a set by selecting existing words via Add Words modal', async ({ page }) => {
    await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);

    await page.goto('/sets/new');

    const setNameInput = page.getByLabel('Set Name');
    await expect(setNameInput).not.toHaveValue('');
    const setName = await setNameInput.inputValue();

    await page.getByRole('button', { name: 'Add Words' }).click();

    const addWordsDialog = page.getByRole('dialog');
    await expect(addWordsDialog).toBeVisible();
    await expect(addWordsDialog.getByRole('heading', { name: 'Select Words' })).toBeVisible();

    const modalSearchInput = addWordsDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill('book');
    await wordsSearchResponse;

    const wordARow = addWordsDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) });
    const wordBRow = addWordsDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) });
    await expect(wordARow).toBeVisible();
    await expect(wordBRow).toBeVisible();

    await wordARow.click();
    await wordBRow.click();

    await addWordsDialog.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) }),
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) }),
    ).toBeVisible();

    const postResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    const createdSetResponse = await postResponse;
    expect(createdSetResponse.ok(), await createdSetResponse.text()).toBeTruthy();
    const createdSet = await createdSetResponse.json();
    testSetIds.push(createdSet.setId);

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await searchSet(page, setName);
    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();
  });

  test('validation - cannot save set with no words selected', async ({ page }) => {
    await page.goto('/sets/new');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

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
    const inlineWordName = 'bookmark';

    await page.goto('/sets/new');

    await page.getByRole('button', { name: 'Create New Word' }).click();

    await expect(page.getByRole('heading', { name: 'Create New Word' })).toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const englishWordInput = dialog.getByLabel('English Word');
    await expect(englishWordInput).toBeVisible();
    await englishWordInput.click();
    await englishWordInput.fill(inlineWordName);
    const translationInput = dialog.getByPlaceholder('Enter translation...').first();
    await translationInput.click();
    await translationInput.fill('zakładka');

    const wordPostResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/words') && resp.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Save' }).click();
    const wordPostResponse = await wordPostResponsePromise;
    expect(wordPostResponse.ok(), await wordPostResponse.text()).toBeTruthy();
    const wordBody = await wordPostResponse.json();
    testWordIds.push(wordBody.wordId);

    await expect(dialog).not.toBeVisible();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: inlineWordName, exact: true }) }),
    ).toBeVisible();

    const setPostResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    const createdSetResponse = await setPostResponse;
    expect(createdSetResponse.ok(), await createdSetResponse.text()).toBeTruthy();
    const createdSet = await createdSetResponse.json();
    testSetIds.push(createdSet.setId);

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('removes a selected word from the set form using the trash icon', async ({ page }) => {
    await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);
    await createWordViaApiReturningId(page, 'bookshop', 'księgarnia', authToken, testWordIds);

    await page.goto('/sets/new');
    await page.getByRole('button', { name: 'Add Words' }).click();

    const removeDialog = page.getByRole('dialog');
    await expect(removeDialog).toBeVisible();
    const modalSearchInput = removeDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill('book');
    await wordsSearchResponse;

    await removeDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) })
      .click();
    await removeDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookshop', exact: true }) })
      .click();
    await removeDialog.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Remove word' }).first().click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
  });

  test('Save (without close) stays on form and switches to edit mode after create', async ({ page }) => {
    await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, testWordIds);

    await page.goto('/sets/new');

    await page.getByRole('button', { name: 'Add Words' }).click();
    const addDialog = page.getByRole('dialog');
    await expect(addDialog).toBeVisible();
    const modalSearchInput = addDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill('book');
    await wordsSearchResponse;
    await addDialog
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'bookcase', exact: true }) })
      .click();
    await addDialog.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const postResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const createdSetResponse = await postResponse;
    expect(createdSetResponse.ok(), await createdSetResponse.text()).toBeTruthy();
    const createdSet = await createdSetResponse.json();
    testSetIds.push(createdSet.setId);

    await expect(page).toHaveURL(/\/sets\/[0-9a-f-]+\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Set' })).toBeVisible();
    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(page.getByText('Set created')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });

  test('back arrow navigates to sets list', async ({ page }) => {
    await page.goto('/sets/new');

    await expect(page.getByRole('heading', { name: 'Create New Set' })).toBeVisible();

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });
});
