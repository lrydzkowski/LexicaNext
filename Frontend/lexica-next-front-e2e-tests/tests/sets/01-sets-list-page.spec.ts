import { test, expect } from '@playwright/test';
import {
  generateTestPrefix,
  captureAuthToken,
  createWordViaApiReturningId,
  createSetViaApi,
  waitForSetsResponse,
  deleteSetViaApi,
  deleteWordsViaApi,
} from './helpers';

test.describe('sets list page', () => {
  let prefix: string;
  let authToken: string;
  let wordId: string;
  let setId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    prefix = generateTestPrefix('sets-list');
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    authToken = await captureAuthToken(page);
    wordId = await createWordViaApiReturningId(page, `${prefix}-word`, 'test-translation', authToken);
    setId = await createSetViaApi(page, [wordId], authToken);

    await page.close();
    await context.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    const storageState = testInfo.project.use.storageState as string;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    await deleteSetViaApi(page, [setId], authToken);
    await deleteWordsViaApi(page, [wordId], authToken);
    await page.close();
    await context.close();
  });

  test('navigates to sets list from header navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sets' }).click();

    await expect(page).toHaveURL(/\/sets/);
    await expect(page.getByRole('heading', { name: 'My Vocabulary Sets' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create New Set' })).toBeVisible();
    await expect(page.getByPlaceholder('Search sets...')).toBeVisible();
  });

  test('renders sets table with correct columns on desktop', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Select all sets' })).toBeVisible();
  });

  test('delete button is disabled when no sets are selected', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    const deleteButton = page.getByRole('button', { name: /Delete/ });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeDisabled();
  });

  test('action menu shows all expected menu items', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    const rows = page
      .getByRole('table')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible();

    const firstActionButton = rows.first().getByRole('button').last();
    await firstActionButton.click();

    await expect(page.getByRole('menuitem', { name: 'Spelling Mode' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Full Mode' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Open Questions Mode' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'View Content' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Edit Set' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Delete Set' })).toBeVisible();
  });

  test('Create New Set link navigates to the create set form', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page);
    await page.goto('/sets');
    await setsResponse;

    await page.getByRole('link', { name: 'Create New Set' }).click();

    await expect(page).toHaveURL(/\/sets\/new/);
    await expect(page.getByRole('heading', { name: 'Create New Set' })).toBeVisible();
  });
});
