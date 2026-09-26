import { test, expect } from '@playwright/test';

test.describe('open home page', () => {
  test('has correct header', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - banner:
      - banner:
        - heading "LexicaNext" [level=1]
        - link "Sets":
          - /url: /sets
        - link "Words":
          - /url: /words
        - link "Words Statistics":
          - /url: /words-statistics
        - link "About":
          - /url: /about
        - button "Open account details"
        - button "Logout":
          - img
          - text: ""
    `);
  });
});
