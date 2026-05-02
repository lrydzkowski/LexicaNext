import { expect, type Page } from '@playwright/test';

export { generateTestPrefix, captureAuthToken, createWordViaApi } from '../words/helpers';
import { generateTestPrefix } from '../words/helpers';

export type SessionMode = 'spelling' | 'full' | 'open-questions' | 'sentences';

const SESSION_KEY_PREFIX = 'lexica-session:';

function buildSessionKey(setId: string, mode: SessionMode): string {
  return `${SESSION_KEY_PREFIX}${setId}:${mode}`;
}

export interface StoredSession {
  setId: string;
  setName: string;
  mode: SessionMode;
  timestamp: number;
  entries: Array<Record<string, unknown>>;
}

export async function readSessionFromStorage(
  page: Page,
  setId: string,
  mode: SessionMode,
): Promise<StoredSession | null> {
  const key = buildSessionKey(setId, mode);
  const raw = await page.evaluate((k) => window.localStorage.getItem(k), key);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as StoredSession;
}

export async function clearAllSessionStorage(page: Page): Promise<void> {
  await page.evaluate((prefix) => {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keys.push(k);
      }
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  }, SESSION_KEY_PREFIX);
}

export async function expectSessionStored(page: Page, setId: string, mode: SessionMode): Promise<StoredSession> {
  const session = await readSessionFromStorage(page, setId, mode);
  expect(session, `expected a stored session at lexica-session:${setId}:${mode}`).not.toBeNull();
  return session!;
}

export async function expectSessionCleared(page: Page, setId: string, mode: SessionMode): Promise<void> {
  const session = await readSessionFromStorage(page, setId, mode);
  expect(session, `expected no stored session at lexica-session:${setId}:${mode}`).toBeNull();
}

export async function expectResumeModalVisible(page: Page, setName: string, modeLabel: string): Promise<void> {
  const modal = page.getByRole('dialog', { name: 'Continue Learning?' });
  await expect(modal).toBeVisible();
  await expect(modal.getByText('You have an unfinished learning session:')).toBeVisible();
  await expect(modal.getByText(setName)).toBeVisible();
  await expect(modal.getByText(modeLabel)).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Start Fresh' })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Continue' })).toBeVisible();
}

export async function createSetViaApi(page: Page, wordIds: string[], authToken: string): Promise<string> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await page.request.post('/api/sets', {
      headers: { authorization: authToken },
      data: { wordIds },
    });
    if (response.ok()) {
      const body = await response.json();
      return body.setId ?? '';
    }
    if (response.status() >= 500 && attempt < maxRetries) {
      await page.waitForTimeout(1000 * attempt);
      continue;
    }
    throw new Error(`Failed to create set via API: ${response.status()}`);
  }

  throw new Error(`Failed to create set via API after ${maxRetries} retries`);
}

export function waitForSetsResponse(page: Page) {
  return page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/sets') && !resp.url().includes('/api/sets/') && resp.request().method() === 'GET',
  );
}

export function waitForSearchSetsResponse(page: Page) {
  return page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/sets') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

export async function searchSet(page: Page, term: string) {
  const searchInput = page.getByPlaceholder('Search sets...');
  await searchInput.click();
  const searchResponse = waitForSearchSetsResponse(page);
  await searchInput.fill(term);
  await searchResponse;
}

export async function createSetViaUI(page: Page, wordNames: string[]): Promise<{ setName: string; setId: string }> {
  await page.goto('/sets/new');

  const setNameInput = page.getByLabel('Set Name');
  await expect(setNameInput).toBeVisible();
  const setName = await setNameInput.inputValue();

  await page.getByRole('button', { name: 'Add Words' }).click();

  const addWordsDialog = page.getByRole('dialog');
  await expect(addWordsDialog).toBeVisible();

  for (const wordName of wordNames) {
    const modalSearchInput = addWordsDialog.getByPlaceholder('Search words...');
    await modalSearchInput.click();
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(wordName);
    await wordsSearchResponse;

    const wordRow = addWordsDialog.getByRole('row').filter({ hasText: wordName });
    await wordRow.click();
  }

  await addWordsDialog.getByRole('button', { name: 'Done' }).click();

  const postResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/sets') && resp.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const postResponse = await postResponsePromise;
  const body = await postResponse.json();
  const setId = body.setId ?? '';

  await expect(page).toHaveURL(/\/sets(\?|$)/);

  return { setName, setId };
}

export async function navigateToSetAction(page: Page, setName: string, action: string) {
  const searchInput = page.getByPlaceholder('Search sets...');
  const currentValue = await searchInput.inputValue();
  if (currentValue !== setName) {
    await searchSet(page, setName);
  }
  await page
    .getByRole('button', { name: `Actions for ${setName}` })
    .first()
    .click();
  await page.getByRole('menuitem', { name: action }).click();
}

export async function deleteSetsByPrefix(page: Page, prefix: string) {
  await page.goto('/sets');

  await searchSet(page, prefix);

  let hasSets = true;
  while (hasSets) {
    const rows = page.getByRole('row').filter({ has: page.getByText(prefix) });
    const rowCount = await rows.count();

    if (rowCount === 0) {
      hasSets = false;
      break;
    }

    const deleteRefetch = waitForSearchSetsResponse(page);
    await page.getByRole('checkbox', { name: 'Select all sets' }).check();
    await page.getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await deleteRefetch;
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
}

export async function deleteWordsViaApi(page: Page, wordIds: string[], authToken: string) {
  const response = await page.request.delete('/api/words', {
    headers: { authorization: authToken },
    data: { ids: wordIds },
  });
  if (!response.ok()) {
    throw new Error(`Failed to delete words via API: ${response.status()}`);
  }
}

export async function createWordViaApiReturningId(
  page: Page,
  name: string,
  translation: string,
  authToken: string,
  options?: { type?: string; sentence?: string },
): Promise<string> {
  const wordType = options?.type ?? 'noun';
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await page.request.post('/api/words', {
      headers: { authorization: authToken },
      data: {
        word: name,
        wordType,
        translations: [translation],
        exampleSentences: options?.sentence ? [options.sentence] : [],
      },
    });
    if (response.ok()) {
      const body = await response.json();
      return body.wordId;
    }
    if (response.status() === 400) {
      return findExistingWordId(page, name, wordType, authToken);
    }
    if (response.status() >= 500 && attempt < maxRetries) {
      await page.waitForTimeout(1000 * attempt);
      continue;
    }
    throw new Error(`Failed to create word "${name}" via API: ${response.status()}`);
  }

  throw new Error(`Failed to create word "${name}" via API after ${maxRetries} retries`);
}

export async function createWordWithSentencesViaApi(
  page: Page,
  name: string,
  translation: string,
  sentences: string[],
  authToken: string,
  options?: { type?: string },
): Promise<string> {
  const wordType = options?.type ?? 'noun';
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await page.request.post('/api/words', {
      headers: { authorization: authToken },
      data: {
        word: name,
        wordType,
        translations: [translation],
        exampleSentences: sentences,
      },
    });
    if (response.ok()) {
      const body = await response.json();
      return body.wordId;
    }
    if (response.status() === 400) {
      return findExistingWordId(page, name, wordType, authToken);
    }
    if (response.status() >= 500 && attempt < maxRetries) {
      await page.waitForTimeout(1000 * attempt);
      continue;
    }
    throw new Error(`Failed to create word "${name}" via API: ${response.status()}`);
  }

  throw new Error(`Failed to create word "${name}" via API after ${maxRetries} retries`);
}

export async function updateWordSentencesViaApi(
  page: Page,
  wordId: string,
  name: string,
  translation: string,
  sentences: string[],
  authToken: string,
  options?: { type?: string },
): Promise<void> {
  const wordType = options?.type ?? 'noun';
  const response = await page.request.put(`/api/words/${wordId}`, {
    headers: { authorization: authToken },
    data: {
      word: name,
      wordType,
      translations: [translation],
      exampleSentences: sentences,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to update word "${name}" via API: ${response.status()}`);
  }
}

async function findExistingWordId(page: Page, name: string, wordType: string, authToken: string): Promise<string> {
  const response = await page.request.get(`/api/words?searchQuery=${encodeURIComponent(name)}`, {
    headers: { authorization: authToken },
  });
  if (!response.ok()) {
    throw new Error(`Failed to search for word "${name}": ${response.status()}`);
  }
  const body = await response.json();
  const items = body.data ?? [];
  const match = items.find(
    (w: { word: string; wordType: string }) =>
      w.word?.toLowerCase() === name.toLowerCase() && w.wordType?.toLowerCase() === wordType.toLowerCase(),
  );
  if (!match) {
    throw new Error(`Word "${name}" (${wordType}) not found after 400 - unexpected`);
  }
  return match.wordId;
}

export async function getSetIdByName(page: Page, setName: string, authToken: string): Promise<string> {
  const response = await page.request.get(`/api/sets?searchQuery=${encodeURIComponent(setName)}`, {
    headers: { authorization: authToken },
  });
  if (!response.ok()) {
    throw new Error(`Failed to search sets: ${response.status()}`);
  }
  const body = await response.json();
  const items = body.data ?? body;
  const match = Array.isArray(items) ? items.find((s: { name: string }) => s.name === setName) : null;
  if (!match) {
    throw new Error(`Set "${setName}" not found`);
  }
  return match.setId;
}

export async function deleteSetViaApi(page: Page, setIds: string[], authToken: string) {
  const response = await page.request.delete('/api/sets', {
    headers: { authorization: authToken },
    data: { ids: setIds },
  });
  if (!response.ok()) {
    throw new Error(`Failed to delete sets via API: ${response.status()}`);
  }
}

export async function getSetNameById(page: Page, setId: string, authToken: string): Promise<string> {
  const response = await page.request.get(`/api/sets/${setId}`, {
    headers: { authorization: authToken },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get set by ID "${setId}": ${response.status()}`);
  }
  const body = await response.json();
  return body.name;
}
