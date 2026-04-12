import { test, expect, type Page } from '@playwright/test';
import {
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

test.describe('spelling mode session resume', () => {
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

  async function createSpellingSet(page: Page, wordDefs: { name: string; translation: string; type?: string }[]) {
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
    const setId = await createSetViaApi(page, createdWordIds, authToken);
    const setName = await getSetNameById(page, setId, authToken);
    return { setName, setId, wordIds: createdWordIds };
  }

  async function warmUpRecordings(page: Page, words: { name: string; type?: string }[]) {
    for (const w of words) {
      const wordType = w.type ?? 'noun';
      await page.request.get(`/api/recordings/${encodeURIComponent(w.name)}?wordType=${wordType}`, {
        headers: { authorization: authToken },
      });
    }
  }

  async function cleanupSet(page: Page, setId: string, wordIds: string[]) {
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, wordIds, authToken);
  }

  async function answerSpelling(page: Page, answer: string) {
    const input = page.getByPlaceholder('Type the word you heard...');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill(answer);
    await page.getByRole('button', { name: 'Check Answer' }).click();
  }

  test('session is persisted to localStorage after an answer', async ({ page }) => {
    const words = [{ name: `apple`, translation: 'jablko', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setName, setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    await answerSpelling(page, `apple`);
    await expect(page.getByText('Correct!')).toBeVisible();

    const session = await expectSessionStored(page, setId, 'spelling');
    expect(session.setId).toBe(setId);
    expect(session.setName).toBe(setName);
    expect(session.mode).toBe('spelling');
    expect(session.entries).toHaveLength(1);
    expect((session.entries[0] as { counter: number }).counter).toBe(1);

    await cleanupSet(page, setId, wordIds);
  });

  test('resume modal appears on reload with correct set name and mode label', async ({ page }) => {
    const words = [{ name: `book`, translation: 'ksiazka', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setName, setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);
    await answerSpelling(page, `book`);
    await expect(page.getByText('Correct!')).toBeVisible();

    await page.reload();

    await expectResumeModalVisible(page, setName, 'Spelling Mode');

    await cleanupSet(page, setId, wordIds);
  });

  test('Continue restores progress and completion requires fewer answers', async ({ page }) => {
    const words = [{ name: `river`, translation: 'rzeka', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setName, setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);
    await answerSpelling(page, `river`);
    await expect(page.getByText('Correct!')).toBeVisible();

    const beforeReload = await expectSessionStored(page, setId, 'spelling');
    expect((beforeReload.entries[0] as { counter: number }).counter).toBe(1);

    await page.reload();

    await expectResumeModalVisible(page, setName, 'Spelling Mode');
    await page.getByRole('dialog', { name: 'Continue Learning?' }).getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(new RegExp(`/sets/${setId}/spelling-mode`));
    await expect(page.getByPlaceholder('Type the word you heard...')).toBeVisible({ timeout: 10000 });

    const afterResume = await expectSessionStored(page, setId, 'spelling');
    expect((afterResume.entries[0] as { counter: number }).counter).toBe(1);

    await answerSpelling(page, `river`);
    await expect(page.getByText('Correct!')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 10000 });
    await expectSessionCleared(page, setId, 'spelling');

    await cleanupSet(page, setId, wordIds);
  });

  test('Start Fresh clears the saved session and dismisses the modal', async ({ page }) => {
    const words = [{ name: `tree`, translation: 'drzewo', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);
    await answerSpelling(page, `tree`);
    await expect(page.getByText('Correct!')).toBeVisible();
    await expectSessionStored(page, setId, 'spelling');

    await page.reload();

    const modal = page.getByRole('dialog', { name: 'Continue Learning?' });
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Start Fresh' }).click();
    await expect(modal).not.toBeVisible();

    await expectSessionCleared(page, setId, 'spelling');

    await cleanupSet(page, setId, wordIds);
  });

  test('session is cleared on completion', async ({ page }) => {
    const words = [{ name: `stone`, translation: 'kamien', type: 'noun' }];
    await warmUpRecordings(page, words);
    const { setId, wordIds } = await createSpellingSet(page, words);

    await page.goto(`/sets/${setId}/spelling-mode`);

    for (let i = 0; i < 2; i++) {
      await answerSpelling(page, `stone`);
      await expect(page.getByText('Correct!')).toBeVisible();
      await page.getByRole('button', { name: 'Continue' }).click();
    }

    await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 10000 });
    await expectSessionCleared(page, setId, 'spelling');

    await cleanupSet(page, setId, wordIds);
  });
});
