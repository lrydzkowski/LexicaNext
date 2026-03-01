import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteWordsViaApi,
  deleteSetViaApi,
  searchSet,
  navigateToSetAction,
  getSetNameFromProposedName,
  waitForSearchSetsResponse,
} from './helpers';

test.describe('delete set', () => {
  const wordIds: string[] = [];
  const setIdsToClean: string[] = [];
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
    if (setIdsToClean.length > 0) {
      try {
        await deleteSetViaApi(page, setIdsToClean, authToken);
      } catch {}
    }
    if (wordIds.length > 0) {
      await deleteWordsViaApi(page, wordIds, authToken);
    }
    await page.close();
    await context.close();
  });

  test('deletes a single set via action menu', async ({ page }) => {
    const prefix = generateTestPrefix('del-single');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setName = await getSetNameFromProposedName(page, authToken);
    await createSetViaApi(page, [wordId], authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Delete Set');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Delete Sets')).toBeVisible();
    await expect(
      dialog.getByText('Are you sure you want to delete the following sets? This action cannot be undone.'),
    ).toBeVisible();
    await expect(dialog.getByText(setName)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Delete' })).toBeVisible();

    const postDeleteRefetch = waitForSearchSetsResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No sets found matching your search.' })).toBeVisible();
  });

  test('deletes multiple sets via bulk selection', async ({ page }) => {
    const prefix = generateTestPrefix('del-bulk');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setNameA = await getSetNameFromProposedName(page, authToken);
    await createSetViaApi(page, [wordId], authToken);
    const setNameB = await getSetNameFromProposedName(page, authToken);
    await createSetViaApi(page, [wordId], authToken);

    await page.goto('/sets');
    await searchSet(page, setNameA.slice(0, -2));

    await page.getByRole('checkbox', { name: `Select ${setNameA}` }).check();
    await page.getByRole('checkbox', { name: `Select ${setNameB}` }).check();

    const deleteButton = page.getByRole('button', { name: /Delete \(2\)/ });
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(setNameA)).toBeVisible();
    await expect(dialog.getByText(setNameB)).toBeVisible();

    const postDeleteRefetch = waitForSearchSetsResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
  });

  test('select all checkbox selects all visible sets', async ({ page }) => {
    const prefix = generateTestPrefix('del-selall');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setNameA = await getSetNameFromProposedName(page, authToken);
    const setIdA = await createSetViaApi(page, [wordId], authToken);
    const setNameB = await getSetNameFromProposedName(page, authToken);
    const setIdB = await createSetViaApi(page, [wordId], authToken);
    setIdsToClean.push(setIdA, setIdB);

    await page.goto('/sets');
    await searchSet(page, setNameA.slice(0, -2));

    await page.getByRole('checkbox', { name: 'Select all sets' }).check();

    await expect(page.getByRole('checkbox', { name: `Select ${setNameA}` })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: `Select ${setNameB}` })).toBeChecked();

    const deleteButton = page.getByRole('button', { name: /Delete/ });
    await expect(deleteButton).toBeEnabled();

    await page.getByRole('checkbox', { name: 'Select all sets' }).uncheck();

    await expect(page.getByRole('checkbox', { name: `Select ${setNameA}` })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: `Select ${setNameB}` })).not.toBeChecked();
    await expect(deleteButton).toBeDisabled();
  });

  test('cancel deletion keeps the set', async ({ page }) => {
    const prefix = generateTestPrefix('del-cancel');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordId], authToken);
    setIdsToClean.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Delete Set');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();
  });

  test('delete button disabled state updates correctly with selection changes', async ({ page }) => {
    const prefix = generateTestPrefix('del-toggle');

    const wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'translation', authToken);
    wordIds.push(wordId);

    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, [wordId], authToken);
    setIdsToClean.push(setId);

    await page.goto('/sets');
    await searchSet(page, setName);

    const deleteButton = page.getByRole('button', { name: /Delete/ });
    await expect(deleteButton).toBeDisabled();

    await page.getByRole('checkbox', { name: `Select ${setName}` }).check();
    await expect(deleteButton).toBeEnabled();
    await expect(page.getByRole('button', { name: /Delete \(1\)/ })).toBeVisible();

    await page.getByRole('checkbox', { name: `Select ${setName}` }).uncheck();
    await expect(deleteButton).toBeDisabled();
  });
});
