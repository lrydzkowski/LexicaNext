import { expect, type Page } from '@playwright/test';

export { generateTestPrefix, captureAuthToken, createWordViaApi } from '../words/helpers';
import { generateTestPrefix } from '../words/helpers';

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

export async function getSetNameFromProposedName(page: Page, authToken: string): Promise<string> {
  const response = await page.request.get('/api/sets/proposed-name', {
    headers: { authorization: authToken },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get proposed name: ${response.status()}`);
  }
  const body = await response.json();
  return body.proposedName ?? body;
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

  for (const wordName of wordNames) {
    const modalSearchInput = page.getByPlaceholder('Search words...');
    const wordsSearchResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
    );
    await modalSearchInput.fill(wordName);
    await wordsSearchResponse;

    const wordRow = page.getByRole('row').filter({ hasText: wordName });
    await wordRow.click();
  }

  await page.getByRole('button', { name: 'Done' }).click();

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
  await page.getByRole('button', { name: `Actions for ${setName}` }).click();
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
