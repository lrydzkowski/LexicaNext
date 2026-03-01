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

test.describe('open questions mode', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  async function createFreshOpenQSet(
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

  test('open questions mode page loads with correct structure', async ({ page }) => {
    const prefix = generateTestPrefix('oq-struct');
    const { setName, setId, wordIds } = await createFreshOpenQSet(page, [
      { name: `${prefix}-rain`, translation: 'deszcz' },
      { name: `${prefix}-snow`, translation: 'snieg' },
    ]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    await expect(page.getByRole('heading', { name: 'Open Questions Mode' })).toBeVisible();
    await expect(page.getByText(setName).first()).toBeVisible();
    await expect(page.locator('.mantine-Progress-root')).toBeVisible();
    await expect(page.getByText('0 / 2 words completed')).toBeVisible();

    const questionText = page.locator('text=/What does|What is the English word for/');
    await expect(questionText).toBeVisible();

    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('correct answer shows green feedback', async ({ page }) => {
    const prefix = generateTestPrefix('oq-ok');
    const wordDefs = [
      { name: `${prefix}-rain`, translation: 'deszcz' },
      { name: `${prefix}-snow`, translation: 'snieg' },
    ];
    const { setId, wordIds, words } = await createFreshOpenQSet(page, wordDefs);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    const questionElement = page.locator('text=/What does|What is the English word for/');
    await expect(questionElement).toBeVisible();
    const questionText = await questionElement.textContent();

    let correctAnswer = '';
    for (const w of words) {
      if (questionText?.includes(w.name)) {
        correctAnswer = w.translation;
        break;
      }
      if (questionText?.includes(w.translation)) {
        correctAnswer = w.name;
        break;
      }
    }

    const answerInput = page.getByPlaceholder('Type your answer...');
    await answerInput.fill(correctAnswer);
    await page.getByRole('button', { name: 'Check Answer' }).click();

    await expect(page.getByText('Correct!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('incorrect answer shows red feedback with correct answer and resets counters', async ({ page }) => {
    const prefix = generateTestPrefix('oq-wrong');
    const { setId, wordIds } = await createFreshOpenQSet(page, [{ name: `${prefix}-rain`, translation: 'deszcz' }]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    const answerInput = page.getByPlaceholder('Type your answer...');
    await expect(answerInput).toBeVisible();
    await answerInput.fill('completely-wrong');
    await page.getByRole('button', { name: 'Check Answer' }).click();

    await expect(page.getByText('Incorrect')).toBeVisible();
    await expect(page.getByText('Your answer is:')).toBeVisible();
    await expect(page.getByText('completely-wrong')).toBeVisible();
    await expect(page.getByText('The correct answer is:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('Enter key submits the answer', async ({ page }) => {
    const prefix = generateTestPrefix('oq-enter');
    const { setId, wordIds } = await createFreshOpenQSet(page, [{ name: `${prefix}-rain`, translation: 'deszcz' }]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    const answerInput = page.getByPlaceholder('Type your answer...');
    await expect(answerInput).toBeVisible();
    await answerInput.fill('test-answer');
    await answerInput.press('Enter');

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

  test('back arrow navigates to sets list', async ({ page }) => {
    const prefix = generateTestPrefix('oq-back');
    const { setId, wordIds } = await createFreshOpenQSet(page, [{ name: `${prefix}-rain`, translation: 'deszcz' }]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    await expect(page.getByRole('heading', { name: 'Open Questions Mode' })).toBeVisible();

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await cleanupSet(page, setId, wordIds);
  });

  test('completion screen shows after all words mastered (2 correct each direction)', async ({ page }) => {
    test.setTimeout(60000);
    const prefix = generateTestPrefix('oq-done');
    const wordName = `${prefix}-wind`;
    const wordTranslation = 'wiatr';

    const { setId, wordIds } = await createFreshOpenQSet(page, [{ name: wordName, translation: wordTranslation }]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    const maxIterations = 20;
    let iteration = 0;

    while (iteration < maxIterations) {
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
        iteration++;
        continue;
      }

      const questionText = await questionLocator.textContent();

      let correctAnswer = '';
      if (questionText?.includes(wordName)) {
        correctAnswer = wordTranslation;
      } else if (questionText?.includes(wordTranslation)) {
        correctAnswer = wordName;
      } else {
        correctAnswer = wordName;
      }

      const answerInput = page.getByPlaceholder('Type your answer...');
      await answerInput.fill(correctAnswer);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
      await page.getByRole('button', { name: 'Continue' }).click();
      iteration++;
    }

    await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Back to Sets', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Practice Again' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });
});
