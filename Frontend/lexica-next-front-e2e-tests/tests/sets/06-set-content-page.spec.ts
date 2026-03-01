import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  getSetNameFromProposedName,
} from './helpers';

test.describe('set content page', () => {
  let prefix: string;
  let authToken: string;
  const wordIds: string[] = [];
  let setName: string;
  let setId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('content');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);

    const wordAId = await createWordViaApiReturningId(page, `${prefix}-word-a`, 'translation-a', authToken, {
      type: 'noun',
      sentence: 'This is an example sentence.',
    });
    const wordBId = await createWordViaApiReturningId(page, `${prefix}-word-b`, 'translation-b', authToken, {
      type: 'adjective',
    });
    wordIds.push(wordAId, wordBId);

    setName = await getSetNameFromProposedName(page, authToken);
    setId = await createSetViaApi(page, [wordAId, wordBId], authToken);

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteSetViaApi(page, [setId], authToken);
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

    await expect(page.getByText(`${prefix}-word-a`)).toBeVisible();
    await expect(page.getByText('Noun').first()).toBeVisible();
    await expect(page.getByText('translation-a')).toBeVisible();
    await expect(page.getByText('This is an example sentence.')).toBeVisible();
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
