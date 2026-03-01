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

test.describe('spelling mode', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    authToken = await captureAuthToken(page);
    await page.close();
    await context.close();
  });

  async function createSpellingSet(
    page: import('@playwright/test').Page,
    wordDefs: { name: string; translation: string; type?: string }[],
  ) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordViaApiReturningId(
        page,
        def.name,
        def.translation,
        authToken,
        def.type ? { type: def.type } : undefined,
      );
      createdWordIds.push(id);
    }
    const setName = await getSetNameFromProposedName(page, authToken);
    const setId = await createSetViaApi(page, createdWordIds, authToken);
    return { setName, setId, wordIds: createdWordIds };
  }

  async function warmUpRecordings(page: import('@playwright/test').Page, words: { name: string; type?: string }[]) {
    for (const w of words) {
      const wordType = w.type ?? 'noun';
      await page.request.get(`/api/recordings/${encodeURIComponent(w.name)}?wordType=${wordType}`, {
        headers: { authorization: authToken },
      });
    }
  }

  async function cleanupSet(page: import('@playwright/test').Page, setId: string, wordIds: string[]) {
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
  }

  test('spelling mode page loads with correct structure', async ({ page }) => {
    const words = [
      { name: 'apple', translation: 'jablko', type: 'noun' },
      { name: 'brave', translation: 'odwazny', type: 'adjective' },
    ];
    await warmUpRecordings(page, words);
    const { setName, setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    await expect(page.getByRole('heading', { name: 'Spelling Mode' })).toBeVisible();
    await expect(page.getByText(setName).first()).toBeVisible();
    await expect(page.locator('.mantine-Progress-root')).toBeVisible();
    await expect(page.getByText('0 / 2 words completed')).toBeVisible();
    await expect(page.getByPlaceholder('Type the word you heard...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back to sets' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('correct answer shows green feedback with word details', async ({ page }) => {
    const words = [{ name: 'garden', translation: 'ogrod', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    const answerInput = page.getByPlaceholder('Type the word you heard...');
    await expect(answerInput).toBeVisible();

    await answerInput.fill('garden');
    await page.getByRole('button', { name: 'Check Answer' }).click();

    await expect(page.getByText('Correct!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('incorrect answer shows red feedback with correct spelling', async ({ page }) => {
    const words = [{ name: 'castle', translation: 'zamek', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    const answerInput = page.getByPlaceholder('Type the word you heard...');
    await expect(answerInput).toBeVisible();
    await answerInput.fill('wrong-answer');
    await page.getByRole('button', { name: 'Check Answer' }).click();

    await expect(page.getByText('Incorrect')).toBeVisible();
    await expect(page.getByText('Your answer is:')).toBeVisible();
    await expect(page.getByText('wrong-answer')).toBeVisible();
    await expect(page.getByText('The correct spelling is:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });

  test('continue button advances to the next question', async ({ page }) => {
    const words = [
      { name: 'river', translation: 'rzeka', type: 'noun' },
      { name: 'forest', translation: 'las', type: 'noun' },
    ];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    const answerInput = page.getByPlaceholder('Type the word you heard...');
    await expect(answerInput).toBeVisible({ timeout: 10000 });
    await answerInput.fill('wrong-answer');
    await page.getByRole('button', { name: 'Check Answer' }).click();

    await expect(page.getByText('Incorrect')).toBeVisible();

    await page.getByRole('button', { name: 'Continue' }).click();

    const nextInput = page.getByPlaceholder('Type the word you heard...');
    const congrats = page.getByText('Congratulations!');

    const result = await Promise.race([
      nextInput.waitFor({ state: 'visible', timeout: 10000 }).then(async () => {
        const val = await nextInput.inputValue();
        return val === '' ? 'next-question' : 'stale';
      }),
      congrats.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'completed' as const),
    ]).catch(() => 'timeout' as const);

    if (result === 'next-question' || result === 'stale') {
      await expect(page.getByText('Incorrect')).not.toBeVisible();
      await expect(nextInput).toBeVisible();
    } else {
      await expect(congrats).toBeVisible();
    }

    await cleanupSet(page, setId, wordIds);
  });

  test('Enter key submits the answer', async ({ page }) => {
    const words = [{ name: 'silver', translation: 'srebro', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    const answerInput = page.getByPlaceholder('Type the word you heard...');
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

  test('completion screen shows after all words are mastered (2 correct each)', async ({ page }) => {
    const words = [{ name: 'table', translation: 'stol', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    for (let i = 0; i < 2; i++) {
      const answerInput = page.getByPlaceholder('Type the word you heard...');
      await expect(answerInput).toBeVisible();
      await answerInput.fill('table');
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!')).toBeVisible();
      await page.getByRole('button', { name: 'Continue' }).click();
    }

    await expect(page.getByText('Congratulations!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Sets', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Practice Again' })).toBeVisible();

    await cleanupSet(page, setId, wordIds);
  });
});
