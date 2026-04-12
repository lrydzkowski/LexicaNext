import { test, expect, type Page } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  deleteSetViaApi,
  deleteWordsViaApi,
  getSetNameById,
  expectSessionStored,
  expectSessionCleared,
  expectResumeModalVisible,
  clearAllSessionStorage,
} from './helpers';

interface OpenQuestionsCounters {
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

function totalCounters(entry: OpenQuestionsCounters): number {
  return entry.englishOpenCounter + entry.nativeOpenCounter;
}

test.describe('open questions mode session resume', () => {
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

  async function createOpenQuestionsSet(page: Page, wordDefs: { name: string; translation: string }[]) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordViaApiReturningId(page, def.name, def.translation, authToken);
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

  async function answerCurrentQuestionCorrectly(page: Page, word: string, translation: string) {
    const questionLocator = page.locator('text=/What does|What is the English word for/');
    await expect(questionLocator).toBeVisible({ timeout: 10000 });
    const questionText = (await questionLocator.textContent()) ?? '';

    const correctAnswer = questionText.includes(word) ? translation : word;

    const input = page.getByPlaceholder('Type your answer...');
    await expect(input).toBeVisible();
    await input.fill(correctAnswer);
    await page.getByRole('button', { name: 'Check Answer' }).click();
  }

  test('session is persisted to localStorage after an answer', async ({ page }) => {
    const prefix = generateTestPrefix('oq-resume-save');
    const word = `${prefix}-wind`;
    const translation = 'wiatr';
    const { setName, setId, wordIds } = await createOpenQuestionsSet(page, [{ name: word, translation }]);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);

      await answerCurrentQuestionCorrectly(page, word, translation);
      await expect(page.getByText('Correct!')).toBeVisible();

      const session = await expectSessionStored(page, setId, 'open-questions');
      expect(session.setId).toBe(setId);
      expect(session.setName).toBe(setName);
      expect(session.mode).toBe('open-questions');
      expect(session.entries).toHaveLength(1);
      const entry = session.entries[0] as unknown as OpenQuestionsCounters;
      expect(totalCounters(entry)).toBe(1);
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('resume modal appears on reload with correct set name and mode label', async ({ page }) => {
    const prefix = generateTestPrefix('oq-resume-modal');
    const word = `${prefix}-cloud`;
    const translation = 'chmura';
    const { setName, setId, wordIds } = await createOpenQuestionsSet(page, [{ name: word, translation }]);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);
      await answerCurrentQuestionCorrectly(page, word, translation);
      await expect(page.getByText('Correct!')).toBeVisible();

      await page.reload();

      await expectResumeModalVisible(page, setName, 'Open Questions Mode');
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('Continue restores progress without resetting counters', async ({ page }) => {
    const prefix = generateTestPrefix('oq-resume-continue');
    const word = `${prefix}-storm`;
    const translation = 'burza';
    const { setName, setId, wordIds } = await createOpenQuestionsSet(page, [{ name: word, translation }]);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);
      await answerCurrentQuestionCorrectly(page, word, translation);
      await expect(page.getByText('Correct!')).toBeVisible();

      const beforeReload = await expectSessionStored(page, setId, 'open-questions');
      const beforeEntry = beforeReload.entries[0] as unknown as OpenQuestionsCounters;
      expect(totalCounters(beforeEntry)).toBe(1);

      await page.reload();

      await expectResumeModalVisible(page, setName, 'Open Questions Mode');
      await page.getByRole('dialog', { name: 'Continue Learning?' }).getByRole('button', { name: 'Continue' }).click();

      await expect(page).toHaveURL(new RegExp(`/sets/${setId}/open-questions-mode`));
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible({ timeout: 10000 });

      const afterResume = await expectSessionStored(page, setId, 'open-questions');
      const afterEntry = afterResume.entries[0] as unknown as OpenQuestionsCounters;
      expect(afterEntry).toEqual(beforeEntry);
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('Start Fresh clears the saved session and dismisses the modal', async ({ page }) => {
    const prefix = generateTestPrefix('oq-resume-fresh');
    const word = `${prefix}-thunder`;
    const translation = 'grzmot';
    const { setId, wordIds } = await createOpenQuestionsSet(page, [{ name: word, translation }]);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);
      await answerCurrentQuestionCorrectly(page, word, translation);
      await expect(page.getByText('Correct!')).toBeVisible();
      await expectSessionStored(page, setId, 'open-questions');

      await page.reload();

      const modal = page.getByRole('dialog', { name: 'Continue Learning?' });
      await expect(modal).toBeVisible();
      await modal.getByRole('button', { name: 'Start Fresh' }).click();
      await expect(modal).not.toBeVisible();

      await expectSessionCleared(page, setId, 'open-questions');
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });

  test('session is cleared on completion', async ({ page }) => {
    test.setTimeout(60000);
    const prefix = generateTestPrefix('oq-resume-complete');
    const word = `${prefix}-lightning`;
    const translation = 'blyskawica';
    const { setId, wordIds } = await createOpenQuestionsSet(page, [{ name: word, translation }]);

    try {
      await page.goto(`/sets/${setId}/open-questions-mode`);

      const maxIterations = 20;
      for (let i = 0; i < maxIterations; i++) {
        const congratsLocator = page.getByText('Congratulations!');
        const questionLocator = page.locator('text=/What does|What is the English word for/');

        const winner = await Promise.race([
          congratsLocator.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'congrats' as const),
          questionLocator.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'question' as const),
        ]).catch(() => 'timeout' as const);

        if (winner === 'congrats') {
          break;
        }
        if (winner === 'timeout') {
          continue;
        }

        await answerCurrentQuestionCorrectly(page, word, translation);
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 10000 });
      await expectSessionCleared(page, setId, 'open-questions');
    } finally {
      await cleanupSet(page, setId, wordIds);
    }
  });
});
