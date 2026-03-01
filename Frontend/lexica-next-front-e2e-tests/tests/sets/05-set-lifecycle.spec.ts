import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  deleteWordsViaApi,
  deleteSetViaApi,
  searchSet,
  navigateToSetAction,
  waitForSearchSetsResponse,
  getSetNameById,
} from './helpers';

test.describe('set full lifecycle', () => {
  const setIdsToClean: string[] = [];
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

  test('create, verify in list, view content, edit words, verify changes, delete, verify removal', async ({ page }) => {
    test.setTimeout(60000);
    const prefix = generateTestPrefix('lifecycle');

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken);
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken);
    wordIds.push(wordAId, wordBId);

    await page.goto('/sets');
    await page.getByRole('link', { name: 'Create New Set' }).click();

    await expect(page).toHaveURL(/\/sets\/new/);
    const setNameInput = page.getByLabel('Set Name');
    const proposedName = await setNameInput.inputValue();
    expect(proposedName).toBeTruthy();

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

    const postResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    const postResponse = await postResponsePromise;
    const postBody = await postResponse.json();
    const setId = postBody.setId;
    setIdsToClean.push(setId);

    const setName = await getSetNameById(page, setId, authToken);

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await searchSet(page, setName);
    await expect(page.getByRole('cell', { name: setName, exact: true })).toBeVisible();

    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByRole('heading', { name: 'Content Mode' })).toBeVisible();
    await expect(page.getByText(setName).first()).toBeVisible();
    await expect(page.getByText(`${prefix}-word-a`)).toBeVisible();
    await expect(page.getByText(`${prefix}-word-b`)).toBeVisible();
    await expect(page.getByText('2', { exact: true })).toBeVisible();

    await page.goto(`/sets/${setId}/edit`);

    await expect(page.getByText('Selected Words (2)')).toBeVisible();

    await page.getByRole('button', { name: 'Remove word' }).first().click();

    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    const putResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/sets/') && resp.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await putResponse;

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await page.goto(`/sets/${setId}/edit`);
    await expect(page.getByText('Selected Words (1)')).toBeVisible();

    await page.goto('/sets');
    await navigateToSetAction(page, setName, 'Delete Set');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const postDeleteRefetch = waitForSearchSetsResponse(page);
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await postDeleteRefetch;

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'No sets found matching your search.' })).toBeVisible();
  });
});
