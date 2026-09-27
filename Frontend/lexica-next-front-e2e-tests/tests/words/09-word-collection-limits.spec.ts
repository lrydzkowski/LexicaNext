import { test, expect } from '@playwright/test';

const collections = [
  {
    name: 'translations',
    placeholder: 'Enter translation...',
    add: 'Add Translation',
    remove: 'Remove translation',
    generate: 'Generate Translations',
    endpoint: '/api/translations/generate',
    responseKey: 'translations',
    limitMessage: 'Use at most 20 translations.',
    initialCount: 1,
  },
  {
    name: 'example sentences',
    placeholder: 'Enter example sentence...',
    add: 'Add Sentence',
    remove: 'Remove sentence',
    generate: 'Generate Sentences',
    endpoint: '/api/sentences/generate',
    responseKey: 'sentences',
    limitMessage: 'Use at most 20 example sentences.',
    initialCount: 0,
  },
];

for (const collection of collections) {
  test(`limits manually added ${collection.name} to 20`, async ({ page }) => {
    await page.goto('/words/new');
    const add = page.getByRole('button', { name: collection.add, exact: true });
    const inputs = page.getByPlaceholder(collection.placeholder);

    for (let count = collection.initialCount; count < 20; count++) {
      await add.click();
    }

    await expect(inputs).toHaveCount(20);
    await expect(add).toBeDisabled();
    await page.getByRole('button', { name: `${collection.remove} 20`, exact: true }).click();
    await expect(inputs).toHaveCount(19);
    await expect(add).toBeEnabled();
    await add.click();
    await expect(inputs).toHaveCount(20);
    await expect(add).toBeDisabled();
  });

  test(`rejects generated overflow and accepts 20 ${collection.name}`, async ({ page }) => {
    let generatedCount = 21;
    await page.route(`**${collection.endpoint}`, (route) =>
      route.fulfill({
        json: { [collection.responseKey]: Array.from({ length: generatedCount }, (_, index) => `Generated ${index}`) },
      }),
    );
    await page.goto('/words/new');
    await page.getByLabel('English Word').fill('collection');
    if (collection.initialCount === 0) {
      await page.getByRole('button', { name: collection.add, exact: true }).click();
    }
    const inputs = page.getByPlaceholder(collection.placeholder);
    await inputs.first().fill('Preserved content');
    await page.getByRole('button', { name: collection.generate, exact: true }).click();

    await expect(page.getByText(collection.limitMessage, { exact: true })).toBeVisible();
    await expect(inputs).toHaveCount(1);
    await expect(inputs.first()).toHaveValue('Preserved content');

    generatedCount = 20;
    await page.getByRole('button', { name: collection.generate, exact: true }).click();
    await expect(inputs).toHaveCount(20);
    await expect(inputs.first()).toHaveValue('Generated 0');
    await expect(inputs.last()).toHaveValue('Generated 19');
    await expect(page.getByRole('button', { name: collection.add, exact: true })).toBeDisabled();
  });
}

test('preserves oversized existing collections and blocks saving until reduced', async ({ page }) => {
  const wordId = '0196294e-9a78-73b5-947e-fb739d73808c';
  const translations = Array.from({ length: 21 }, (_, index) => `Translation ${index}`);
  const sentences = Array.from({ length: 21 }, (_, index) => `Sentence ${index}`);
  const updates: unknown[] = [];
  await page.route(`**/api/words/${wordId}`, (route) => {
    if (route.request().method() === 'PUT') {
      updates.push(route.request().postDataJSON());
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({
      json: { wordId, word: 'collection', wordType: 'noun', translations, exampleSentences: sentences },
    });
  });
  await page.route('**/api/words?*', (route) => route.fulfill({ json: { data: [], count: 0 } }));
  await page.goto(`/words/${wordId}/edit`);

  await expect(page.getByPlaceholder('Enter translation...')).toHaveCount(21);
  await expect(page.getByPlaceholder('Enter example sentence...')).toHaveCount(21);
  await expect(page.getByPlaceholder('Enter translation...').last()).toHaveValue('Translation 20');
  await expect(page.getByPlaceholder('Enter example sentence...').last()).toHaveValue('Sentence 20');
  await expect(page.getByRole('button', { name: 'Add Translation', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Add Sentence', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Use at most 20 translations.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Use at most 20 example sentences.' })).toBeVisible();
  expect(updates).toHaveLength(0);

  await page.getByRole('button', { name: 'Remove translation 21', exact: true }).click();
  await page.getByRole('button', { name: 'Remove sentence 21', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  const saved = page.waitForResponse((response) => response.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await saved;
  expect(updates).toEqual([
    {
      word: 'collection',
      wordType: 'noun',
      translations: translations.slice(0, 20),
      exampleSentences: sentences.slice(0, 20),
    },
  ]);
});
