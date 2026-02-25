import { test, expect } from '@playwright/test';

test.describe.serial('word form - remove translations and sentences', () => {
  test('removes a translation from the form', async ({ page }) => {
    await page.goto('/words/new');

    await page.getByLabel('English Word').fill('amalgamate');
    await page.getByPlaceholder('Enter translation...').fill('laczyc');
    await page.getByRole('button', { name: 'Add Translation' }).click();
    await page.getByPlaceholder('Enter translation...').last().fill('scalac');

    const translationInputs = page.getByPlaceholder('Enter translation...');
    await expect(translationInputs).toHaveCount(2);

    await page.getByRole('button', { name: 'Remove translation 1' }).click();

    await expect(translationInputs).toHaveCount(1);
    await expect(translationInputs.first()).toHaveValue('scalac');
  });

  test('cannot remove the last translation', async ({ page }) => {
    await page.goto('/words/new');

    const translationInputs = page.getByPlaceholder('Enter translation...');
    await expect(translationInputs).toHaveCount(1);

    await expect(page.getByRole('button', { name: /Remove translation/ })).not.toBeVisible();
  });

  test('removes an example sentence', async ({ page }) => {
    await page.goto('/words/new');

    await page.getByRole('button', { name: 'Add Sentence' }).click();
    await page.getByRole('button', { name: 'Add Sentence' }).click();

    const sentenceInputs = page.getByPlaceholder('Enter example sentence...');
    await expect(sentenceInputs).toHaveCount(2);

    await sentenceInputs.first().fill('First sentence.');
    await sentenceInputs.last().fill('Second sentence.');

    await page.getByRole('button', { name: 'Remove sentence 1' }).click();

    await expect(sentenceInputs).toHaveCount(1);
    await expect(sentenceInputs.first()).toHaveValue('Second sentence.');
  });
});
