import { test, expect } from '@playwright/test';

test.describe.serial('open home page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'LexicaNext' })).toBeVisible();
  });
});
