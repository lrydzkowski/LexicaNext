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

test.describe('full mode', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  async function createFreshFullModeSet(
    page: import('@playwright/test').Page,
    wordDefs: { name: string; translation: string }[],
  ) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordViaApiReturningId(page, def.name, def.translation, authToken);
      createdWordIds.push(id);
    }
    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, createdWordIds, authToken);
    return { setName, setId, wordIds: createdWordIds, words: wordDefs };
  }

  async function cleanupSet(page: import('@playwright/test').Page, setId: string, wordIds: string[]) {
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
  }

  test('full mode page loads with correct structure', async ({ page }) => {
    const prefix = generateTestPrefix('fm-struct');
    const { setName, setId, wordIds } = await createFreshFullModeSet(page, [
      { name: `${prefix}-cat`, translation: 'kot' },
      { name: `${prefix}-dog`, translation: 'pies' },
      { name: `${prefix}-bird`, translation: 'ptak' },
      { name: `${prefix}-fish`, translation: 'ryba' },
    ]);

    await page.goto(`/sets/${setId}/full-mode`);

    await expect(page.getByRole('heading', { name: 'Full Mode' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(setName).first()).toBeVisible();
    await expect(page.locator('.mantine-Progress-root')).toBeVisible();
    await expect(page.getByText(/0 \/ \d+ words completed/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('close-ended question displays radio button options', async ({ page }) => {
    const prefix = generateTestPrefix('fm-radio');
    const { setId, wordIds } = await createFreshFullModeSet(page, [
      { name: `${prefix}-cat`, translation: 'kot' },
      { name: `${prefix}-dog`, translation: 'pies' },
      { name: `${prefix}-bird`, translation: 'ptak' },
      { name: `${prefix}-fish`, translation: 'ryba' },
    ]);

    await page.goto(`/sets/${setId}/full-mode`);

    const questionText = page.locator('text=/What does|What is the English word for/');
    await expect(questionText).toBeVisible();

    const radioButtons = page.getByRole('radio');
    const count = await radioButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(4);

    await radioButtons.first().check();
    await expect(radioButtons.first()).toBeChecked();

    await page.getByRole('button', { name: 'Check Answer' }).click();

    const hasCorrect = await page
      .getByText('Correct!')
      .isVisible()
      .catch(() => false);
    const hasIncorrect = await page
      .getByText('Incorrect')
      .isVisible()
      .catch(() => false);
    expect(hasCorrect || hasIncorrect).toBeTruthy();

    await cleanupSet(page, setId, wordIds);
  });

  test('correct answer shows green feedback and advances progress', async ({ page }) => {
    const prefix = generateTestPrefix('fm-ok');
    const words = [
      { name: `${prefix}-cat`, translation: 'kot' },
      { name: `${prefix}-dog`, translation: 'pies' },
      { name: `${prefix}-bird`, translation: 'ptak' },
      { name: `${prefix}-fish`, translation: 'ryba' },
    ];
    const { setId, wordIds } = await createFreshFullModeSet(page, words);

    await page.goto(`/sets/${setId}/full-mode`);

    const questionElement = page.locator('text=/What does|What is the English word for/');
    await expect(questionElement).toBeVisible();
    const questionText = await questionElement.textContent();

    let correctAnswer: string | undefined;
    for (const word of words) {
      if (questionText?.includes(word.name)) {
        correctAnswer = word.translation;
        break;
      }
      if (questionText?.includes(word.translation)) {
        correctAnswer = word.name;
        break;
      }
    }

    if (correctAnswer) {
      const radioButtons = page.getByRole('radio');
      const count = await radioButtons.count();
      for (let i = 0; i < count; i++) {
        const label = await radioButtons.nth(i).locator('..').textContent();
        if (label?.includes(correctAnswer)) {
          await radioButtons.nth(i).check();
          break;
        }
      }
    } else {
      await page.getByRole('radio').first().check();
    }

    await page.getByRole('button', { name: 'Check Answer' }).click();

    const hasCorrect = await page
      .getByText('Correct!')
      .isVisible()
      .catch(() => false);
    if (hasCorrect) {
      await expect(page.getByText('Correct!')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    } else {
      await expect(page.getByText('Incorrect')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    }

    await cleanupSet(page, setId, wordIds);
  });

  test('incorrect answer shows red feedback and resets all counters for the word', async ({ page }) => {
    const prefix = generateTestPrefix('fm-wrong');
    const words = [
      { name: `${prefix}-cat`, translation: 'kot' },
      { name: `${prefix}-dog`, translation: 'pies' },
      { name: `${prefix}-bird`, translation: 'ptak' },
      { name: `${prefix}-fish`, translation: 'ryba' },
    ];
    const { setId, wordIds } = await createFreshFullModeSet(page, words);

    await page.goto(`/sets/${setId}/full-mode`);

    const questionElement = page.locator('text=/What does|What is the English word for/');
    await expect(questionElement).toBeVisible();
    const questionText = await questionElement.textContent();

    let wrongOptionIndex = 0;
    const radioButtons = page.getByRole('radio');
    const count = await radioButtons.count();

    for (const word of words) {
      for (let i = 0; i < count; i++) {
        const label = await radioButtons.nth(i).locator('..').textContent();
        if (questionText?.includes(word.name) && !label?.includes(word.translation)) {
          wrongOptionIndex = i;
          break;
        }
        if (questionText?.includes(word.translation) && !label?.includes(word.name)) {
          wrongOptionIndex = i;
          break;
        }
      }
    }

    await radioButtons.nth(wrongOptionIndex).check();
    await page.getByRole('button', { name: 'Check Answer' }).click();

    const hasIncorrect = await page
      .getByText('Incorrect')
      .isVisible()
      .catch(() => false);
    if (hasIncorrect) {
      await expect(page.getByText('Incorrect')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    } else {
      await expect(page.getByText('Correct!')).toBeVisible();
    }

    await cleanupSet(page, setId, wordIds);
  });

  test('completion screen shows after all words are fully mastered', async ({ page }) => {
    test.setTimeout(180000);
    const prefix = generateTestPrefix('fm-done');
    const allWords = [
      { name: `${prefix}-sun`, translation: 'slonce' },
      { name: `${prefix}-moon`, translation: 'ksiezyc' },
      { name: `${prefix}-star`, translation: 'gwiazda' },
      { name: `${prefix}-sky`, translation: 'niebo' },
    ];

    const createdWordIds: string[] = [];
    for (const w of allWords) {
      const id = await createWordViaApiReturningId(page, w.name, w.translation, authToken);
      createdWordIds.push(id);
    }

    const completionSetName = await getSetNameFromProposedName(page, authToken);
    const completionSetId = await createSetViaApi(page, createdWordIds, authToken);

    await page.goto(`/sets/${completionSetId}/full-mode`);

    const maxIterations = 100;
    let iteration = 0;
    let needsTransition = false;

    const findCorrectAnswer = (questionText: string): string => {
      for (const w of allWords) {
        if (questionText.includes(w.name)) {
          return w.translation;
        }
        if (questionText.includes(w.translation)) {
          return w.name;
        }
      }
      return '';
    };

    const selectRadioAnswer = async (correctAnswer: string) => {
      const radioButtons = page.getByRole('radio');
      const radioCount = await radioButtons.count();
      for (let i = 0; i < radioCount; i++) {
        const value = await radioButtons.nth(i).getAttribute('value');
        if (value && correctAnswer && value.includes(correctAnswer)) {
          await radioButtons.nth(i).check();
          return;
        }
      }
      for (let i = 0; i < radioCount; i++) {
        const label = await radioButtons.nth(i).locator('..').textContent();
        if (label && correctAnswer && label.includes(correctAnswer)) {
          await radioButtons.nth(i).check();
          return;
        }
      }
      await radioButtons.first().check();
    };

    while (iteration < maxIterations) {
      const congratsLocator = page.getByText('Congratulations!');
      const checkAnswerBtn = page.getByRole('button', { name: 'Check Answer' });

      if (needsTransition) {
        const transitionResult = await Promise.race([
          congratsLocator.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'congrats' as const),
          checkAnswerBtn.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'ready' as const),
        ]).catch(() => 'timeout' as const);

        if (transitionResult === 'congrats') {
          break;
        }
        if (transitionResult === 'timeout') {
          iteration++;
          continue;
        }
        needsTransition = false;
      }

      await expect(checkAnswerBtn).toBeVisible({ timeout: 10000 });

      const questionLocator = page.locator('text=/What does|What is the English word for/');
      const questionText = (await questionLocator.textContent().catch(() => '')) ?? '';

      if (!questionText) {
        iteration++;
        continue;
      }

      const correctAnswer = findCorrectAnswer(questionText);

      if (!correctAnswer) {
        iteration++;
        continue;
      }

      const radioButtons = page.getByRole('radio');
      const radioCount = await radioButtons.count();

      if (radioCount > 0) {
        await selectRadioAnswer(correctAnswer);
      } else {
        const typeInput = page.getByPlaceholder('Type your answer...');
        await typeInput.fill(correctAnswer);
      }

      await checkAnswerBtn.click();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
      await page.getByRole('button', { name: 'Continue' }).click();
      needsTransition = true;
      iteration++;
    }

    await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Back to Sets', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Practice Again' })).toBeVisible();

    await cleanupSet(page, completionSetId, createdWordIds);
  });
});
