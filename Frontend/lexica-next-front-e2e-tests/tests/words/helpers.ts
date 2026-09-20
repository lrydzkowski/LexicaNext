import { expect, type Page } from '@playwright/test';

export async function captureAuthToken(page: Page): Promise<string> {
  const requestPromise = page.waitForRequest((req) => req.url().includes('/api/') && !!req.headers()['authorization']);
  await page.goto('/words');
  const request = await requestPromise;
  return request.headers()['authorization'];
}

export async function createWordViaApi(
  page: Page,
  name: string,
  translation: string,
  authToken: string,
  options?: { type?: string; createdWordIds?: string[] },
) {
  const response = await page.request.post('/api/words', {
    headers: { authorization: authToken },
    data: {
      word: name,
      wordType: options?.type ?? 'noun',
      translations: [translation],
      exampleSentences: [],
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create word "${name}" via API: ${response.status()}`);
  }
  const { wordId } = await response.json();
  options?.createdWordIds?.push(wordId);
  return wordId as string;
}

export function waitForSearchResponse(page: Page) {
  return page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/words') && resp.url().includes('searchQuery') && resp.request().method() === 'GET',
  );
}

export function waitForWordsResponse(page: Page) {
  return page.waitForResponse((resp) => resp.url().includes('/api/words') && resp.request().method() === 'GET');
}

export async function createWord(
  page: Page,
  name: string,
  translation: string,
  options?: { type?: string; secondTranslation?: string; sentence?: string; createdWordIds?: string[] },
) {
  await page.goto('/words/new');
  await page.getByLabel('English Word').fill(name);

  if (options?.type) {
    await page.getByRole('combobox', { name: 'Word Type' }).click();
    await page.getByRole('option', { name: options.type }).click();
  }

  await page.getByPlaceholder('Enter translation...').first().fill(translation);

  if (options?.secondTranslation) {
    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill(options.secondTranslation);
  }

  if (options?.sentence) {
    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByPlaceholder('Enter example sentence...').fill(options.sentence);
  }

  const responsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/words' && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(`Failed to create word "${name}" via UI: ${response.status()} ${await response.text()}`);
  }
  const { wordId } = await response.json();
  options?.createdWordIds?.push(wordId);
  await expect(page).toHaveURL(/\/words(\?|$)/);
  return wordId as string;
}

export async function searchWord(page: Page, term: string) {
  const searchInput = page.getByPlaceholder('Search words...');
  const searchResponse = waitForSearchResponse(page);
  await searchInput.fill(term);
  await searchResponse;
}

export async function deleteWordsViaApi(page: Page, wordIds: string[], authToken: string) {
  if (wordIds.length === 0) {
    return;
  }
  const response = await page.request.delete('/api/words', {
    headers: { authorization: authToken },
    data: { ids: wordIds },
  });
  if (!response.ok()) {
    throw new Error(`Failed to delete words via API: ${response.status()}`);
  }
}
