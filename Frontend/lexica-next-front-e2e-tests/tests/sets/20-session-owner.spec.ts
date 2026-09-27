import { expect, test, type Page } from '@playwright/test';
import { authenticate, getAuthConfig } from '../auth/authenticate';
import {
  buildSessionKey,
  captureAuthToken,
  clearAllSessionStorage,
  expectResumeModalVisible,
  expectSessionCleared,
  expectSessionStored,
  getSessionUserId,
  type StoredSession,
} from './helpers';

const entry = {
  wordId: '7953c03a-3ea3-4fc6-bec4-767df645c438',
  word: 'apple',
  wordType: 'noun',
  translations: ['jablko'],
  exampleSentences: [],
  englishOpenCounter: 1,
  nativeOpenCounter: 1,
};

async function storeSession(page: Page, userId: string | undefined, setId: string, name: string, timestamp = 100) {
  const key = userId ? buildSessionKey(userId, setId, 'open-questions') : `lexica-session:${setId}:open-questions`;
  const session: StoredSession = {
    setId,
    setName: name,
    mode: 'open-questions',
    timestamp,
    entries: [entry],
  };
  const value = JSON.stringify(session);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key, value });
  return { key, value };
}

async function expectSaveUnchanged(page: Page, saved: { key: string; value: string }) {
  expect(await page.evaluate((key) => localStorage.getItem(key), saved.key)).toBe(saved.value);
}

test.describe('saved session ownership', () => {
  let userId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext({ storageState: testInfo.project.use.storageState as string });
    try {
      userId = getSessionUserId(await captureAuthToken(await context.newPage()));
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('button', { name: 'Open account details' })).toBeVisible();
    await clearAllSessionStorage(page);
  });

  test('foreign and legacy sessions never trigger the resume dialog', async ({ page }) => {
    const foreign = await storeSession(page, `${userId}:other`, 'practice:random', 'Foreign practice');
    const legacy = await storeSession(page, undefined, 'practice:weakest', 'Legacy practice');

    await page.reload();

    await expect(page.getByRole('button', { name: 'Open account details' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Continue Learning?' })).not.toBeVisible();
    await expectSaveUnchanged(page, foreign);
    await expectSaveUnchanged(page, legacy);
  });

  test('only the current user is offered a session and Start Fresh preserves other saves', async ({ page }) => {
    await storeSession(page, userId, 'practice:random', 'My practice');
    const foreign = await storeSession(page, `${userId}:other`, 'practice:random', 'Newer foreign practice', 200);
    const legacy = await storeSession(page, undefined, 'practice:random', 'Newest legacy practice', 300);

    await page.reload();

    await expectResumeModalVisible(page, 'My practice', 'Open Questions Mode');
    await page.getByRole('dialog').getByRole('button', { name: 'Start Fresh' }).click();
    await expectSessionCleared(page, userId, 'practice:random', 'open-questions');
    await expectSaveUnchanged(page, foreign);
    await expectSaveUnchanged(page, legacy);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Open account details' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Continue Learning?' })).not.toBeVisible();
  });

  for (const practice of ['random', 'weakest']) {
    test(`${practice} practice starts fresh when only another user's progress exists`, async ({ page }) => {
      const setId = `practice:${practice}`;
      const foreign = await storeSession(page, `${userId}:other`, setId, 'Foreign practice');
      const legacy = await storeSession(page, undefined, setId, 'Legacy practice');
      await page.route(`**/api/practice/open-questions/${practice}`, (route) =>
        route.fulfill({ json: { entries: [entry] } }),
      );
      await page.route('**/api/answer', (route) => route.fulfill({ status: 204 }));
      await page.route('**/api/recordings/**', (route) => route.fulfill({ status: 404 }));

      await page.goto(`/practice/open-questions/${practice}`);

      const question = page.locator('text=/What does|What is the English word for/');
      await expect(question).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Continue Learning?' })).not.toBeVisible();
      const answer = (await question.textContent())?.includes('apple') ? 'jablko' : 'apple';
      await page.getByPlaceholder('Type your answer...').fill(answer);
      await page.getByRole('button', { name: 'Check Answer' }).click();
      await expect(page.getByText('Correct!', { exact: true })).toBeVisible();
      const session = await expectSessionStored(page, userId, setId, 'open-questions');
      const savedEntry = session.entries[0];
      expect(Number(savedEntry.englishOpenCounter) + Number(savedEntry.nativeOpenCounter)).toBe(1);
      await expectSaveUnchanged(page, foreign);
      await expectSaveUnchanged(page, legacy);
    });
  }

  test('switching accounts preserves each owner session and resumes it on return', async ({ page }, testInfo) => {
    test.setTimeout(120000);
    const originalGroup = testInfo.project.name.startsWith('user-a') ? 'user-a' : 'user-b';
    const otherGroup = originalGroup === 'user-a' ? 'user-b' : 'user-a';
    const original = await storeSession(page, userId, 'practice:random', 'Original account practice');

    await page.getByRole('button', { name: 'Logout', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign In to Continue' })).toBeVisible();
    await authenticate(page, getAuthConfig(otherGroup));
    await expect(page.getByRole('button', { name: 'Open account details' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Continue Learning?' })).not.toBeVisible();
    const otherId = getSessionUserId(await captureAuthToken(page));
    expect(otherId).not.toBe(userId);
    const other = await storeSession(page, otherId, 'practice:random', 'Other account practice');
    await page.goto('/about');
    await expectResumeModalVisible(page, 'Other account practice', 'Open Questions Mode');
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Logout', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign In to Continue' })).toBeVisible();
    await authenticate(page, getAuthConfig(originalGroup));
    await expectResumeModalVisible(page, 'Original account practice', 'Open Questions Mode');
    await expectSaveUnchanged(page, original);
    await expectSaveUnchanged(page, other);
    await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page).toHaveURL(/\/practice\/open-questions\/random$/);
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    const resumed = await expectSessionStored(page, userId, 'practice:random', 'open-questions');
    expect(resumed.entries).toEqual([entry]);
  });
});
