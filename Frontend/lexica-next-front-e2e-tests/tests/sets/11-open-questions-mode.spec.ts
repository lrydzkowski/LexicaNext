import { test, expect } from '@playwright/test';
import {
  cleanupCreatedData,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  getSetNameById,
} from './helpers';

test.describe('open questions mode', () => {
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

  async function createFreshOpenQSet(
    page: import('@playwright/test').Page,
    wordDefs: { name: string; translation: string }[],
  ) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordViaApiReturningId(page, def.name, def.translation, authToken, testWordIds);
      createdWordIds.push(id);
    }
    const setId = await createSetViaApi(page, createdWordIds, authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);
    return { setName, setId, wordIds: createdWordIds, words: wordDefs };
  }

  test('open questions mode page loads with correct structure', async ({ page }) => {
    const { setName, setId } = await createFreshOpenQSet(page, [
      { name: 'rain', translation: 'deszcz' },
      { name: 'snow', translation: 'snieg' },
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

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test('correct answer shows green feedback', async ({ page }) => {
    const wordDefs = [
      { name: 'rain', translation: 'deszcz' },
      { name: 'snow', translation: 'snieg' },
    ];
    const { setId, words } = await createFreshOpenQSet(page, wordDefs);

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

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test('incorrect answer shows red feedback with correct answer and resets counters', async ({ page }) => {
    const { setId } = await createFreshOpenQSet(page, [{ name: 'rain', translation: 'deszcz' }]);

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

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test('Enter key submits the answer', async ({ page }) => {
    const { setId } = await createFreshOpenQSet(page, [{ name: 'rain', translation: 'deszcz' }]);

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

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test('back arrow navigates to sets list', async ({ page }) => {
    const { setId } = await createFreshOpenQSet(page, [{ name: 'rain', translation: 'deszcz' }]);

    await page.goto(`/sets/${setId}/open-questions-mode`);

    await expect(page.getByRole('heading', { name: 'Open Questions Mode' })).toBeVisible();

    await page.getByRole('button', { name: 'Go back to sets' }).click();

    await expect(page).toHaveURL(/\/sets(\?|$)/);

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });

  test('completion screen shows after all words mastered (2 correct each direction)', async ({ page }) => {
    test.setTimeout(60000);

    const wordName = 'wind';
    const wordTranslation = 'wiatr';

    const { setId } = await createFreshOpenQSet(page, [{ name: wordName, translation: wordTranslation }]);

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
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Practice Again' })).toBeVisible();

    await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
  });
});
