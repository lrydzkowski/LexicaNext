import { test, expect } from '@playwright/test';
import {
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  getSetNameById,
} from './helpers';

test.describe('set content page', () => {
  let authToken: string;
  const setIds: string[] = [];
  const wordIds: string[] = [];
  let setName: string;
  let setId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);

    const wordAId = await createWordViaApiReturningId(page, 'bookcase', 'regał', authToken, wordIds, {
      type: 'noun',
      sentence: 'The bookcase is full of books.',
    });
    const wordBId = await createWordViaApiReturningId(page, 'brave', 'odważny', authToken, wordIds, {
      type: 'adjective',
    });

    setId = await createSetViaApi(page, [wordAId, wordBId], authToken, setIds);
    setName = await getSetNameById(page, setId, authToken);

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteSetViaApi(page, setIds, authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
    await page.close();
    await context.close();
  });

  test('displays set content with word cards and set information', async ({ page }) => {
    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByRole('heading', { name: 'Content Mode' })).toBeVisible();
    await expect(page.getByText(setName).first()).toBeVisible();
    await expect(page.getByText('Vocabulary List')).toBeVisible();
    await expect(page.getByText('2 words')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back to sets' })).toBeVisible();
  });

  test('word cards display word details correctly', async ({ page }) => {
    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByText('bookcase', { exact: true })).toBeVisible();
    await expect(page.getByText('Noun').first()).toBeVisible();
    await expect(page.getByText('regał')).toBeVisible();
    await expect(page.getByText('The bookcase is full of books.')).toBeVisible();
  });

  test('set information card shows correct metadata', async ({ page }) => {
    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByText('Set Information')).toBeVisible();
    await expect(page.getByText('Created:')).toBeVisible();
    await expect(page.getByText('Total Words:')).toBeVisible();
    await expect(page.getByText('Word Types:')).toBeVisible();
  });

  test('word card shows dictionary links', async ({ page }) => {
    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByRole('link', { name: /Cambridge/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Ling/ }).first()).toBeVisible();
  });

  test('back arrow navigates to sets list', async ({ page }) => {
    await page.goto(`/sets/${setId}/content`);

    await expect(page.getByRole('heading', { name: 'Content Mode' })).toBeVisible();

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);
  });
});
