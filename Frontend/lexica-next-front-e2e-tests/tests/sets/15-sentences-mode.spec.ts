import { test, expect, type Page } from '@playwright/test';
import {
  cleanupCreatedData,
  captureAuthToken,
  createWordWithSentencesViaApi,
  createSetViaApi,
  getSetNameById,
} from './helpers';

interface WordWithSentences {
  name: string;
  translation: string;
  sentences: string[];
}

test.describe('sentences mode', () => {
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

  async function createSentencesSet(page: Page, wordDefs: WordWithSentences[]) {
    const createdWordIds: string[] = [];
    for (const def of wordDefs) {
      const id = await createWordWithSentencesViaApi(
        page,
        def.name,
        def.translation,
        def.sentences,
        authToken,
        testWordIds,
      );
      createdWordIds.push(id);
    }
    const setId = await createSetViaApi(page, createdWordIds, authToken, testSetIds);
    const setName = await getSetNameById(page, setId, authToken);
    return { setName, setId, wordIds: createdWordIds };
  }

  test('sentences mode page loads with correct structure', async ({ page }) => {
    const word = 'mat';
    const { setName, setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByRole('heading', { name: 'Sentences Mode' })).toBeVisible();
      await expect(page.getByText(setName).first()).toBeVisible();
      await expect(page.locator('.mantine-Progress-root')).toBeVisible();
      await expect(page.getByText('0 / 1 questions completed')).toBeVisible();
      await expect(page.getByText('The cat sat on the _____.')).toBeVisible();
      await expect(page.getByPlaceholder('Type the missing word...')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Go back to sets' })).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('correct answer shows green feedback and Continue', async ({ page }) => {
    const word = 'mat';
    const { setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await page.getByRole('button', { name: 'Check Answer' }).click();

      await expect(page.getByText('Correct!')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('incorrect answer shows red feedback with given/expected lines', async ({ page }) => {
    const word = 'mat';
    const { setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill('completely-wrong');
      await page.getByRole('button', { name: 'Check Answer' }).click();

      await expect(page.getByText('Incorrect')).toBeVisible();
      await expect(page.getByText('Your answer is:')).toBeVisible();
      await expect(page.getByText('completely-wrong')).toBeVisible();
      await expect(page.getByText('The correct answer is:')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('empty submission is treated as incorrect', async ({ page }) => {
    const word = 'mat';
    const { setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await page.getByRole('button', { name: 'Check Answer' }).click();

      await expect(page.getByText('Incorrect')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('Enter key submits the answer', async ({ page }) => {
    const word = 'mat';
    const { setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      const input = page.getByPlaceholder('Type the missing word...');
      await expect(input).toBeVisible();
      await input.fill(word);
      await input.press('Enter');

      await expect(page.getByText('Correct!')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('back arrow navigates to sets list', async ({ page }) => {
    const word = 'mat';
    const { setId } = await createSentencesSet(page, [
      { name: word, translation: 'mata', sentences: [`The cat sat on the ${word}.`] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByRole('heading', { name: 'Sentences Mode' })).toBeVisible();

      await page.getByRole('button', { name: 'Go back to sets' }).click();

      await expect(page).toHaveURL(/\/sets(\?|$)/);
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('entry with no example sentences is excluded from the rotation', async ({ page }) => {
    const wordEligible = 'mat';
    const wordExcluded = 'ghost';
    const { setId } = await createSentencesSet(page, [
      { name: wordEligible, translation: 'mata', sentences: [`The cat sat on the ${wordEligible}.`] },
      { name: wordExcluded, translation: 'duch', sentences: [] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByText('0 / 1 questions completed')).toBeVisible();
      await expect(page.getByText(`The cat sat on the _____.`)).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('entry whose sentences omit the target word is excluded', async ({ page }) => {
    const wordEligible = 'mat';
    const wordExcluded = 'ghost';
    const { setId } = await createSentencesSet(page, [
      { name: wordEligible, translation: 'mata', sentences: [`The cat sat on the ${wordEligible}.`] },
      {
        name: wordExcluded,
        translation: 'duch',
        sentences: ['This sentence does not contain the target.', 'Neither does this one.'],
      },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByText('0 / 1 questions completed')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('set with all entries excluded shows empty-state alert', async ({ page }) => {
    const { setId } = await createSentencesSet(page, [
      { name: 'bookcase', translation: 'alfa', sentences: ['No matching word here.'] },
      { name: 'bookshop', translation: 'beta', sentences: [] },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByText('No usable example sentences')).toBeVisible();
      await expect(page.getByPlaceholder('Type the missing word...')).not.toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('per-entry cap of 5 sentences applies', async ({ page }) => {
    const word = 'leaf';
    const sentences = Array.from({ length: 7 }, (_, i) => `Sentence ${i + 1} mentions the ${word} here.`);
    const { setId } = await createSentencesSet(page, [{ name: word, translation: 'lisc', sentences }]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByText('0 / 5 questions completed')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });

  test('multi-entry session aggregates per-(entry, sentence) questions', async ({ page }) => {
    const wordA = 'river';
    const wordB = 'stone';
    const { setId } = await createSentencesSet(page, [
      {
        name: wordA,
        translation: 'rzeka',
        sentences: [`The ${wordA} flows.`, `Cross the ${wordA} carefully.`, `A ${wordA} runs through it.`],
      },
      {
        name: wordB,
        translation: 'kamien',
        sentences: [`A ${wordB} is heavy.`, `Skip the ${wordB}.`],
      },
    ]);

    try {
      await page.goto(`/sets/${setId}/sentences-mode`);

      await expect(page.getByText('0 / 5 questions completed')).toBeVisible();
    } finally {
      await cleanupCreatedData(page, testWordIds, testSetIds, authToken);
    }
  });
});
