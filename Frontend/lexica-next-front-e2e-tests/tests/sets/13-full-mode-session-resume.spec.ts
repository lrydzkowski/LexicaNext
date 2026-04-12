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

interface FullModeCounters {
  englishCloseCounter: number;
  nativeCloseCounter: number;
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

function totalCounters(entry: FullModeCounters): number {
  return entry.englishCloseCounter + entry.nativeCloseCounter + entry.englishOpenCounter + entry.nativeOpenCounter;
}

test.describe('full mode session resume', () => {
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

  async function createFullModeSet(page: Page, wordDefs: { name: string; translation: string }[]) {
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

    let correctAnswer = '';
    if (questionText.includes(word)) {
      correctAnswer = translation;
    } else if (questionText.includes(translation)) {
      correctAnswer = word;
    }

    const radioButtons = page.getByRole('radio');
    const radioCount = await radioButtons.count();

    if (radioCount > 0) {
      let matched = false;
      for (let i = 0; i < radioCount; i++) {
        const value = await radioButtons.nth(i).getAttribute('value');
        if (value && correctAnswer && value.includes(correctAnswer)) {
          await radioButtons.nth(i).check();
          matched = true;
          break;
        }
      }
      if (!matched) {
        await radioButtons.first().check();
      }
    } else {
      const input = page.getByPlaceholder('Type your answer...');
      await expect(input).toBeVisible();
      await input.fill(correctAnswer);
    }

    await page.getByRole('button', { name: 'Check Answer' }).click();
  }

  test('session is persisted to localStorage after an answer', async ({ page }) => {
    const prefix = generateTestPrefix('fm-resume-save');
    const word = `${prefix}-mountain`;
    const translation = 'gora';
    const { setName, setId, wordIds } = await createFullModeSet(page, [{ name: word, translation }]);

    await page.goto(`/sets/${setId}/full-mode`);

    await answerCurrentQuestionCorrectly(page, word, translation);
    await expect(page.getByText('Correct!')).toBeVisible();

    const session = await expectSessionStored(page, setId, 'full');
    expect(session.setId).toBe(setId);
    expect(session.setName).toBe(setName);
    expect(session.mode).toBe('full');
    expect(session.entries).toHaveLength(1);
    const entry = session.entries[0] as unknown as FullModeCounters;
    expect(totalCounters(entry)).toBeGreaterThan(0);

    await cleanupSet(page, setId, wordIds);
  });

  test('resume modal appears on reload with correct set name and mode label', async ({ page }) => {
    const prefix = generateTestPrefix('fm-resume-modal');
    const word = `${prefix}-ocean`;
    const translation = 'ocean';
    const { setName, setId, wordIds } = await createFullModeSet(page, [{ name: word, translation }]);

    await page.goto(`/sets/${setId}/full-mode`);
    await answerCurrentQuestionCorrectly(page, word, translation);
    await expect(page.getByText('Correct!')).toBeVisible();

    await page.reload();

    await expectResumeModalVisible(page, setName, 'Full Mode');

    await cleanupSet(page, setId, wordIds);
  });

  test('Continue restores progress without resetting counters', async ({ page }) => {
    const prefix = generateTestPrefix('fm-resume-continue');
    const word = `${prefix}-valley`;
    const translation = 'dolina';
    const { setName, setId, wordIds } = await createFullModeSet(page, [{ name: word, translation }]);

    await page.goto(`/sets/${setId}/full-mode`);
    await answerCurrentQuestionCorrectly(page, word, translation);
    await expect(page.getByText('Correct!')).toBeVisible();

    const beforeReload = await expectSessionStored(page, setId, 'full');
    const beforeEntry = beforeReload.entries[0] as unknown as FullModeCounters;
    const beforeTotal = totalCounters(beforeEntry);
    expect(beforeTotal).toBeGreaterThan(0);

    await page.reload();

    await expectResumeModalVisible(page, setName, 'Full Mode');
    await page.getByRole('dialog', { name: 'Continue Learning?' }).getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(new RegExp(`/sets/${setId}/full-mode`));
    await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible({ timeout: 10000 });

    const afterResume = await expectSessionStored(page, setId, 'full');
    const afterEntry = afterResume.entries[0] as unknown as FullModeCounters;
    expect(afterEntry).toEqual(beforeEntry);

    await cleanupSet(page, setId, wordIds);
  });

  test('Start Fresh clears the saved session and dismisses the modal', async ({ page }) => {
    const prefix = generateTestPrefix('fm-resume-fresh');
    const word = `${prefix}-island`;
    const translation = 'wyspa';
    const { setId, wordIds } = await createFullModeSet(page, [{ name: word, translation }]);

    await page.goto(`/sets/${setId}/full-mode`);
    await answerCurrentQuestionCorrectly(page, word, translation);
    await expect(page.getByText('Correct!')).toBeVisible();
    await expectSessionStored(page, setId, 'full');

    await page.reload();

    const modal = page.getByRole('dialog', { name: 'Continue Learning?' });
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Start Fresh' }).click();
    await expect(modal).not.toBeVisible();

    await expectSessionCleared(page, setId, 'full');

    await cleanupSet(page, setId, wordIds);
  });

  test('session is cleared on completion', async ({ page }) => {
    test.setTimeout(180000);
    const prefix = generateTestPrefix('fm-resume-complete');
    const word = `${prefix}-desert`;
    const translation = 'pustynia';
    const { setId, wordIds } = await createFullModeSet(page, [{ name: word, translation }]);

    await page.goto(`/sets/${setId}/full-mode`);

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

    await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 15000 });
    await expectSessionCleared(page, setId, 'full');

    await cleanupSet(page, setId, wordIds);
  });
});
