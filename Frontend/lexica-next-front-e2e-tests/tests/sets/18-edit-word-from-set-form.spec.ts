import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  navigateToSetAction,
  getSetNameById,
} from './helpers';

test.describe('edit word from set form', () => {
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

  test('edits a word inline from the set edit form and persists the change', async ({ page }) => {
    const prefix = generateTestPrefix('edit-inline');
    const originalWordName = `${prefix}-word`;
    const updatedWordName = `${prefix}-word-updated`;

    const wordId = await createWordViaApiReturningId(page, originalWordName, 'translation', authToken);
    wordIds.push(wordId);

    const setId = await createSetViaApi(page, [wordId], authToken);
    const setName = await getSetNameById(page, setId, authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: originalWordName })).toBeVisible();

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

    await expect(page.getByRole('row').filter({ hasText: updatedWordName })).toBeVisible();
    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const setPutResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await setPutResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByRole('row').filter({ hasText: updatedWordName })).toBeVisible();
  });

  test('cancelling the edit modal leaves the row unchanged', async ({ page }) => {
    const prefix = generateTestPrefix('edit-cancel');
    const wordName = `${prefix}-word`;

    const wordId = await createWordViaApiReturningId(page, wordName, 'translation', authToken);
    wordIds.push(wordId);

    const setId = await createSetViaApi(page, [wordId], authToken);
    const setName = await getSetNameById(page, setId, authToken);
    setIds.push(setId);

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Edit Set');

    await expect(page.getByText('Selected Words (1)')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: wordName })).toBeVisible();

    await page.getByRole('button', { name: 'Edit word' }).first().click();

    await expect(page.getByRole('heading', { name: 'Edit Word' })).toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const englishWordInput = dialog.getByLabel('English Word');
    await expect(englishWordInput).toHaveValue(wordName);
    await englishWordInput.clear();
    await englishWordInput.fill('should-not-be-saved');

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: wordName })).toBeVisible();
    await expect(page.getByText('should-not-be-saved')).not.toBeVisible();
  });
});
