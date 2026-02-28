import { expect, type Page } from '@playwright/test';

export function generateTestPrefix(context: string): string {
  return `e2e-${context}-${Date.now()}`;
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
  options?: { type?: string; secondTranslation?: string; sentence?: string },
) {
  await page.goto('/words/new');
  await page.getByLabel('English Word').fill(name);

  if (options?.type) {
    await page.getByRole('textbox', { name: 'Word Type' }).click();
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

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/words(\?|$)/);
}

export async function searchWord(page: Page, term: string) {
  const searchInput = page.getByPlaceholder('Search words...');
  const searchResponse = waitForSearchResponse(page);
  await searchInput.fill(term);
  await searchResponse;
}

export async function deleteWordsByPrefix(page: Page, prefix: string) {
  await page.goto('/words');

  await searchWord(page, prefix);

  let hasWords = true;
  while (hasWords) {
    const rows = page.getByRole('row').filter({ has: page.getByText(prefix) });
    const rowCount = await rows.count();

    if (rowCount === 0) {
      hasWords = false;
      break;
    }

    const deleteRefetch = waitForSearchResponse(page);
    await page.getByRole('checkbox', { name: 'Select all words' }).check();
    await page.getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await deleteRefetch;
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
}
