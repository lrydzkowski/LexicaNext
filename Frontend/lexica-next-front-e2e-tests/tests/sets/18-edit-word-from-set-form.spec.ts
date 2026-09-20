import { test, expect } from '@playwright/test';
import {
  cleanupCreatedData,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  navigateToSetAction,
  getSetNameById,
} from './helpers';

test.describe('edit word from set form', () => {
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

  test('edits a word inline from the set edit form and persists the change', async ({ page }) => {
    const originalWordName = 'bookcase';
    const updatedWordName = 'notebook';

    const wordId = await createWordViaApiReturningId(page, originalWordName, 'regał', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: originalWordName, exact: true }) }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit word' }).first().click();

    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const englishWordInput = dialog.getByLabel('English Word');
    await expect(englishWordInput).toHaveValue(originalWordName);
    await englishWordInput.clear();
    await englishWordInput.fill(updatedWordName);

    const wordPutResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/words/') && resp.request().method() === 'PUT',
    );
    await dialog.getByRole('button', { name: 'Save' }).click();
    await wordPutResponsePromise;

    await expect(dialog).not.toBeVisible();

    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: updatedWordName, exact: true }) }),
    ).toBeVisible();
    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const setPutResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await setPutResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: updatedWordName, exact: true }) }),
    ).toBeVisible();
  });

  test('cancelling the edit modal leaves the row unchanged', async ({ page }) => {
    const wordName = 'bookcase';

    const wordId = await createWordViaApiReturningId(page, wordName, 'regał', authToken, testWordIds);

    const setId = await createSetViaApi(page, [wordId], authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: wordName, exact: true }) }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit word' }).first().click();

    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const englishWordInput = dialog.getByLabel('English Word');
    await expect(englishWordInput).toHaveValue(wordName);
    await englishWordInput.clear();
    await englishWordInput.fill('pear');

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name: wordName, exact: true }) }),
    ).toBeVisible();
    await expect(page.getByText('pear')).not.toBeVisible();
  });
});
