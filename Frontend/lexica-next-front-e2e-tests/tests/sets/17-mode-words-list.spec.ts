import { test, expect, type Page } from '@playwright/test';
import {
  cleanupCreatedData,
  captureAuthToken,
  createWordViaApiReturningId,
  createWordWithSentencesViaApi,
  createSetViaApi,
} from './helpers';

test.describe('mode words list', () => {
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

  async function createSimpleSet(page: Page, wordDefs: { name: string; translation: string }[]) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordViaApiReturningId(page, def.name, def.translation, authToken, testWordIds);
      createdWordIds.push(id);
    }
    const setId = await createSetViaApi(page, createdWordIds, authToken, testSetIds);
    return { setId, wordIds: createdWordIds };
  }

  async function openWordsModal(page: Page) {
    await page.getByRole('button', { name: 'Show Words' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Words in this mode')).toBeVisible();
    return dialog;
  }

  async function closeWordsModal(page: Page, dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }

  test('full mode shows the words list modal with all set words', async ({ page }) => {
    const wordDefs = [
      { name: 'cat', translation: 'kot' },
      { name: 'dog', translation: 'pies' },
      { name: 'bird', translation: 'ptak' },
      { name: 'fish', translation: 'ryba' },
    ];
    const { setId } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/full-mode`);
      await expect(page.getByRole('heading', { name: 'Full Mode' })).toBeVisible({ timeout: 10000 });

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name, { exact: true })).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('spelling mode shows the words list modal with all set words', async ({ page }) => {
    const wordDefs = [
      { name: 'apple', translation: 'jablko' },
      { name: 'pear', translation: 'gruszka' },
    ];
    const { setId } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/spelling-mode`);
      await expect(page.getByRole('heading', { name: 'Spelling Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name, { exact: true })).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type the word you heard...')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('open questions mode shows the words list modal with all set words', async ({ page }) => {
    const wordDefs = [
      { name: 'rain', translation: 'deszcz' },
      { name: 'snow', translation: 'snieg' },
    ];
    const { setId } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);
      await expect(page.getByRole('heading', { name: 'Open Questions Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name, { exact: true })).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('sentences mode shows only words with eligible sentences', async ({ page }) => {
    const includedWord = 'mat';
    const excludedWord = 'glove';

    const includedId = await createWordWithSentencesViaApi(
      page,
      includedWord,
      'mata',
      [`The cat sat on the ${includedWord}.`],
      authToken,
      testWordIds,
    );
    const excludedId = await createWordWithSentencesViaApi(
      page,
      excludedWord,
      'rekawiczka',
      ['Something completely unrelated to the headword.'],
      authToken,
      testWordIds,
    );
    const setId = await createSetViaApi(page, [includedId, excludedId], authToken, testSetIds);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);
      await expect(page.getByRole('heading', { name: 'Sentences Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      await expect(dialog.getByText(includedWord, { exact: true })).toBeVisible();
      await expect(dialog.getByText(excludedWord, { exact: true })).toHaveCount(0);

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type the missing word...')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });
});
