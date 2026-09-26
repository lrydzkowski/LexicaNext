import { expect, test } from '@playwright/test';
import { getAuthConfig } from './auth/authenticate';

test.describe('account details', () => {
  test('closes when Escape is pressed on the trigger immediately after opening', async ({ page }) => {
    await page.goto('/about');
    const trigger = page.getByRole('button', { name: 'Open account details' });
    await trigger.press('Enter');
    await trigger.press('Escape');

    await expect(page.getByRole('dialog', { name: 'Your account', exact: true })).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('shows the signed-in email and build version on desktop', async ({ page }, testInfo) => {
    const group = testInfo.project.name.startsWith('user-a') ? 'user-a' : 'user-b';
    const { email } = getAuthConfig(group);
    await page.goto('/about');
    const trigger = page.getByRole('button', { name: 'Open account details' });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const details = page.getByRole('dialog', { name: 'Your account', exact: true });
    await expect(details).toBeVisible();
    await expect(details.getByText(email, { exact: true })).toBeVisible();
    await expect(details.getByText('Build version', { exact: true })).toBeVisible();
    await expect(details.getByText(/^(Development|\d{4}\.\d{2}\.\d{2}-\d{6})$/)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(details).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await page.getByRole('heading', { name: 'LexicaNext', exact: true }).click();
    await expect(details).not.toBeVisible();
  });

  test('shows account details below mobile navigation and above Logout', async ({ page }, testInfo) => {
    const group = testInfo.project.name.startsWith('user-a') ? 'user-a' : 'user-b';
    const { email } = getAuthConfig(group);
    await page.setViewportSize({ width: 350, height: 640 });
    await page.goto('/about');
    await expect(page.getByRole('button', { name: 'Open account details' })).not.toBeVisible();
    const trigger = page.getByRole('button', { name: 'Toggle navigation' });
    await trigger.click();
    const navigation = page.locator('.mantine-Drawer-content');
    await expect(navigation).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect
      .poll(async () => {
        const box = await navigation.boundingBox();
        return box ? Math.abs(box.x) < 1 && Math.abs(box.width - 350) < 1 : false;
      })
      .toBe(true);
    await expect(navigation.locator('a, p, button').filter({ hasText: /\S/ })).toHaveText([
      'Sets',
      'Words',
      'Words Statistics',
      'About',
      'Your account',
      email,
      'Build version',
      /^(Development|\d{4}\.\d{2}\.\d{2}-\d{6})$/,
      'Logout',
    ]);
    await expect(navigation.getByText(email, { exact: true })).toBeVisible();
    await expect(navigation.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.locator('.mantine-Popover-dropdown')).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await navigation.getByRole('button', { name: 'Close navigation' }).click();
    await expect(navigation).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(navigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(navigation).not.toBeVisible();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await navigation.getByRole('link', { name: 'Sets', exact: true }).click();
    await expect(page).toHaveURL('/sets');
    await expect(navigation).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });
});

test.describe('signed-out account details', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows only public navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 350, height: 640 });
    await page.goto('/sign-in');
    await page.getByRole('button', { name: 'Toggle navigation' }).click();

    const navigation = page.locator('.mantine-Drawer-content');
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(navigation.getByText('Your account', { exact: true })).toHaveCount(0);
    await expect(navigation.getByText('Build version', { exact: true })).toHaveCount(0);
    await expect(navigation.getByRole('button', { name: 'Logout' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open account details' })).toHaveCount(0);
  });
});
