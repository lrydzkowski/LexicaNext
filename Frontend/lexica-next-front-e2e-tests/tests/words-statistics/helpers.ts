import { expect, type Page } from '@playwright/test';

export function generateTestPrefix(context: string): string {
  return `e2e-${context}-${Date.now()}`;
}

export async function captureAuthToken(page: Page): Promise<string> {
  const requestPromise = page.waitForRequest(
    (req) => req.url().includes('/api/') && !!req.headers()['authorization'],
  );
  await page.goto('/words');
  const request = await requestPromise;
  return request.headers()['authorization'];
}

export function waitForStatisticsResponse(page: Page) {
  return page.waitForResponse(
    (resp) => resp.url().includes('/api/words-statistics') && resp.request().method() === 'GET',
  );
}

export async function createWordViaApi(
  page: Page,
  word: string,
  translation: string,
  authToken: string,
): Promise<string> {
  const response = await page.request.post('/api/words', {
    headers: { authorization: authToken },
    data: {
      word,
      wordType: 'noun',
      translations: [translation],
      exampleSentences: [],
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create word "${word}" via API: ${response.status()}`);
  }
  const body = await response.json();
  return body.wordId as string;
}

export async function registerAnswerViaApi(
  page: Page,
  wordId: string,
  word: string,
  isCorrect: boolean,
  authToken: string,
) {
  const response = await page.request.post('/api/answer', {
    headers: { authorization: authToken },
    data: {
      modeType: 'open-questions',
      questionType: 'english-open',
      question: word,
      givenAnswer: isCorrect ? word : 'wrong',
      expectedAnswer: word,
      isCorrect,
      wordId,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to register answer for "${word}" via API: ${response.status()}`);
  }
}

export async function seedOpenQuestionAnswersViaApi(
  page: Page,
  authToken: string,
  options: { word: string; translation: string; correctCount: number; incorrectCount: number },
): Promise<string> {
  const wordId = await createWordViaApi(page, options.word, options.translation, authToken);
  for (let i = 0; i < options.correctCount; i++) {
    await registerAnswerViaApi(page, wordId, options.word, true, authToken);
  }
  for (let i = 0; i < options.incorrectCount; i++) {
    await registerAnswerViaApi(page, wordId, options.word, false, authToken);
  }
  return wordId;
}

export async function deleteWordsByPrefixViaApi(page: Page, prefix: string, authToken: string) {
  const listResponse = await page.request.get(
    `/api/words?pageSize=200&searchQuery=${encodeURIComponent(prefix)}`,
    {
      headers: { authorization: authToken },
    },
  );
  if (!listResponse.ok()) {
    throw new Error(`Failed to list words for cleanup: ${listResponse.status()}`);
  }
  const body = await listResponse.json();
  const ids: string[] = (body.data ?? []).map((w: { wordId: string }) => w.wordId);
  if (ids.length === 0) {
    return;
  }

  const deleteResponse = await page.request.delete('/api/words', {
    headers: { authorization: authToken },
    data: { ids },
  });
  if (!deleteResponse.ok()) {
    throw new Error(`Failed to delete words by prefix: ${deleteResponse.status()}`);
  }
}

export async function openStatisticsPage(page: Page, query?: Record<string, string>) {
  const url = query
    ? `/words-statistics?${new URLSearchParams(query).toString()}`
    : '/words-statistics';
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'Words Statistics' })).toBeVisible();
}
