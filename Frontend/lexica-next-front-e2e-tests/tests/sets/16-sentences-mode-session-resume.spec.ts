import { test, expect, type Page } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordWithSentencesViaApi,
  updateWordSentencesViaApi,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  getSetNameById,
  expectSessionStored,
  expectSessionCleared,
  expectResumeModalVisible,
  clearAllSessionStorage,
} from './helpers';

interface SentencesEntryShape {
  word: string;
  exampleSentences: string[];
  selectedSentenceIndices: number[];
  sentenceCounters: Record<string, number>;
}

interface WordWithSentences {
  name: string;
  translation: string;
  sentences: string[];
}

test.describe('sentences mode session resume', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  test.afterEach(async ({ page }) => {
    await clearAllSessionStorage(page).catch(() => undefined);
  });

  async function createSentencesSet(page: Page, wordDefs: WordWithSentences[]) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordWithSentencesViaApi(page, def.name, def.translation, def.sentences, authToken);
      createdWordIds.push(id);
    }
    const setId = await createSetViaApi(page, createdWordIds, authToken);
    const setName = await getSetNameById(page, setId, authToken);
    return { setName, setId, wordIds: createdWordIds };
  }

  async function cleanupSet(page: Page, setId: string, wordIds: string[]) {
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
  }

  test('session is persisted to localStorage after one answer', async ({ page }) => {
    const prefix = generateTestPrefix('sn-resume-save');
    const word = `${prefix}-mat`;
    const { setName, setId, wordIds } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();

      const session = await expectSessionStored(page, setId, 'sentences');
      expect(session.setId).toBe(setId);
      expect(session.setName).toBe(setName);
      expect(session.mode).toBe('sentences');
      expect(session.entries).toHaveLength(1);
      const entry = session.entries[0] as unknown as SentencesEntryShape;
      expect(entry.selectedSentenceIndices).toEqual([0]);
      expect(entry.sentenceCounters).toEqual({ '0': 1 });
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('reload restores per-pair counters', async ({ page }) => {
    const prefix = generateTestPrefix('sn-resume-restore');
    const word = `${prefix}-mat`;
    const { setName, setId, wordIds } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);
      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();

      const before = await expectSessionStored(page, setId, 'sentences');
      const beforeEntry = before.entries[0] as unknown as SentencesEntryShape;
      expect(beforeEntry.sentenceCounters).toEqual({ '0': 1 });

      await page.reload();

      await expectResumeModalVisible(page, setName, 'Sentences Mode');
      await page.getByRole('dialog', { name: 'Continue Learning?' }).getByRole('button', { name: 'Continue' }).click();

      await expect(page).toHaveURL(new RegExp(`/sets/${setId}/sentences-mode`));
      await expect(page.getByPlaceholder('Type the missing word...')).toBeVisible({ timeout: 10000 });

      const after = await expectSessionStored(page, setId, 'sentences');
      const afterEntry = after.entries[0] as unknown as SentencesEntryShape;
      expect(afterEntry.sentenceCounters).toEqual(beforeEntry.sentenceCounters);
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('only the answered (entry, sentence) pair counter advances', async ({ page }) => {
    const prefix = generateTestPrefix('sn-resume-pair');
    const word = `${prefix}-mat`;
    const sentences = [`The cat sat on the ${word}.`, `She bought a new ${word}.`, `Wipe your feet on the ${word}.`];
    const { setId, wordIds } = await createSentencesSet(page, [{ name: word, translation: 'mata', sentences }]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const card = page.locator('text=/_____/').first();
      await expect(card).toBeVisible();
      const sentenceShown = (await card.textContent()) ?? '';
      const matchedIndex = sentences.findIndex(
        (s) => s.replace(new RegExp(`\\b${word}\\b`, 'i'), '_____') === sentenceShown,
      );
      expect(matchedIndex).toBeGreaterThanOrEqual(0);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();

      const session = await expectSessionStored(page, setId, 'sentences');
      const entry = session.entries[0] as unknown as SentencesEntryShape;
      expect(entry.selectedSentenceIndices).toEqual([0, 1, 2]);
      expect(entry.sentenceCounters[String(matchedIndex)]).toBe(1);

      let othersAtZero = 0;
      for (const idx of entry.selectedSentenceIndices) {
        if (idx === matchedIndex) {
          continue;
        }
        expect(entry.sentenceCounters[String(idx)]).toBe(0);
        othersAtZero++;
      }
      expect(othersAtZero).toBe(2);
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('reload restores counters when some entries have no eligible sentences', async ({ page }) => {
    const prefix = generateTestPrefix('sn-resume-filtered');
    const eligibleWord = `${prefix}-mat`;
    const ineligibleWord = `${prefix}-dog`;
    const { setName, setId, wordIds } = await createSentencesSet(page, [
      { name: eligibleWord, translation: 'mata', sentences: [`The cat sat on the ${eligibleWord}.`] },
      { name: ineligibleWord, translation: 'pies', sentences: ['She loves to dance.'] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);
      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(eligibleWord);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();

      const before = await expectSessionStored(page, setId, 'sentences');
      expect(before.entries).toHaveLength(1);
      const beforeEntry = before.entries[0] as unknown as SentencesEntryShape;
      expect(beforeEntry.word).toBe(eligibleWord);
      expect(beforeEntry.sentenceCounters).toEqual({ '0': 1 });

      await page.reload();

      await expectResumeModalVisible(page, setName, 'Sentences Mode');
      await page.getByRole('dialog', { name: 'Continue Learning?' }).getByRole('button', { name: 'Continue' }).click();

      await expect(page).toHaveURL(new RegExp(`/sets/${setId}/sentences-mode`));
      await expect(page.getByPlaceholder('Type the missing word...')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('0 / 1 questions completed')).toBeVisible();

      const after = await expectSessionStored(page, setId, 'sentences');
      expect(after.entries).toHaveLength(1);
      const afterEntry = after.entries[0] as unknown as SentencesEntryShape;
      expect(afterEntry.word).toBe(eligibleWord);
      expect(afterEntry.sentenceCounters).toEqual(beforeEntry.sentenceCounters);
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('Start Fresh clears the saved session and dismisses the modal', async ({ page }) => {
    const prefix = generateTestPrefix('sn-resume-fresh');
    const word = `${prefix}-mat`;
    const { setId, wordIds } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);
      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();
      await expectSessionStored(page, setId, 'sentences');

      await page.reload();

      const modal = page.getByRole('dialog', { name: 'Continue Learning?' });
      await expect(modal).toBeVisible();
      await modal.getByRole('button', { name: 'Start Fresh' }).click();
      await expect(modal).not.toBeVisible();

      await expectSessionCleared(page, setId, 'sentences');
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });
});
