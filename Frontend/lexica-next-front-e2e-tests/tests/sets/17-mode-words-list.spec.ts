import { test, expect, type Page } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createWordWithSentencesViaApi,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
} from './helpers';

test.describe('mode words list', () => {
  let authToken: string;

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
      const id = await createWordViaApiReturningId(page, def.name, def.translation, authToken);
      createdWordIds.push(id);
    }
    const setId = await createSetViaApi(page, createdWordIds, authToken);
    return { setId, wordIds: createdWordIds };
  }

  async function cleanupSet(page: Page, setId: string, wordIds: string[]) {
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
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
    const prefix = generateTestPrefix('mwl-full');
    const wordDefs = [
      { name: `${prefix}-cat`, translation: 'kot' },
      { name: `${prefix}-dog`, translation: 'pies' },
      { name: `${prefix}-bird`, translation: 'ptak' },
      { name: `${prefix}-fish`, translation: 'ryba' },
    ];
    const { setId, wordIds } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/full-mode`);
      await expect(page.getByRole('heading', { name: 'Full Mode' })).toBeVisible({ timeout: 10000 });

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name)).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('spelling mode shows the words list modal with all set words', async ({ page }) => {
    const wordDefs = [
      { name: `apple`, translation: 'jablko' },
      { name: `pear`, translation: 'gruszka' },
    ];
    const { setId, wordIds } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/spelling-mode`);
      await expect(page.getByRole('heading', { name: 'Spelling Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name)).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type the word you heard...')).toBeVisible();
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('open questions mode shows the words list modal with all set words', async ({ page }) => {
    const prefix = generateTestPrefix('mwl-oq');
    const wordDefs = [
      { name: `${prefix}-rain`, translation: 'deszcz' },
      { name: `${prefix}-snow`, translation: 'snieg' },
    ];
    const { setId, wordIds } = await createSimpleSet(page, wordDefs);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);
      await expect(page.getByRole('heading', { name: 'Open Questions Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      for (const def of wordDefs) {
        await expect(dialog.getByText(def.name)).toBeVisible();
      }

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('sentences mode shows only words with eligible sentences', async ({ page }) => {
    const prefix = generateTestPrefix('mwl-sn');
    const includedWord = `${prefix}-mat`;
    const excludedWord = `${prefix}-glove`;

    const includedId = await createWordWithSentencesViaApi(
      page,
      includedWord,
      'mata',
      [`The cat sat on the ${includedWord}.`],
      authToken,
    );
    const excludedId = await createWordWithSentencesViaApi(
      page,
      excludedWord,
      'rekawiczka',
      ['Something completely unrelated to the headword.'],
      authToken,
    );
    const setId = await createSetViaApi(page, [includedId, excludedId], authToken);
    const wordIds = [includedId, excludedId];

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);
      await expect(page.getByRole('heading', { name: 'Sentences Mode' })).toBeVisible();

      const dialog = await openWordsModal(page);
      await expect(dialog.getByText(includedWord)).toBeVisible();
      await expect(dialog.getByText(excludedWord)).toHaveCount(0);

      await closeWordsModal(page, dialog);
      await expect(page.getByPlaceholder('Type the missing word...')).toBeVisible();
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });
});
