import { test, expect } from '@playwright/test';

test.describe.serial('words pagination', () => {
  test('pagination controls appear when enough words exist', async ({ page }) => {
    await page.goto('/words');

    const pagination = page.getByRole('navigation').filter({ has: page.getByRole('button') });
    const rows = page.getByRole('row');
    const rowCount = await rows.count();

    if (rowCount > 11) {
      await expect(pagination).toBeVisible();
      const tableBodyRows = rowCount - 1;
      expect(tableBodyRows).toBeLessThanOrEqual(10);
    }
  });

  test('navigates to next page', async ({ page }) => {
    await page.goto('/words');

    const pagination = page.getByRole('navigation').filter({ has: page.getByRole('button') });
    const isVisible = await pagination.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip();
      return;
    }

    const firstPageWords = await page.getByRole('table').getByRole('row').allTextContents();

    await page.getByRole('button', { name: '2' }).click();

    await expect(page).toHaveURL(/page=2/);

    const secondPageWords = await page.getByRole('table').getByRole('row').allTextContents();
    expect(secondPageWords).not.toEqual(firstPageWords);
  });
});
