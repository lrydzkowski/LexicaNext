import { expect, test, type Page } from '@playwright/test';
import { clearAllSessionStorage } from '../sets/helpers';

const entry = {
  wordId: '7953c03a-3ea3-4fc6-bec4-767df645c438',
  word: 'apple',
  wordType: 'noun',
  translations: ['jablko'],
  exampleSentences: [],
};

async function answerCurrentQuestion(page: Page) {
  const question = page.getByText(/What does|What is the English word for/);
  await expect(question).toBeVisible();
  const answer = (await question.textContent())?.includes('apple') ? 'jablko' : 'apple';
  await page.getByPlaceholder('Type your answer...').fill(answer);
  await page.getByRole('button', { name: 'Check Answer', exact: true }).click();
  await expect(page.getByText('Correct!', { exact: true })).toBeVisible();
}

test.describe('practice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await clearAllSessionStorage(page);
    await page.route('**/api/answer', (route) => route.fulfill({ status: 204 }));
    await page.route('**/api/recordings/**', (route) => route.fulfill({ status: 404 }));
  });

  for (const width of [1280, 800, 375]) {
    test(`offers practice cards and navigation at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      let selections = 0;
      await page.route('**/api/practice/open-questions/*', (route) => {
        selections++;
        return route.fulfill({ json: { entries: [entry] } });
      });
      await page.goto('/about');
      if (width < 992) {
        await page.getByRole('button', { name: 'Toggle navigation' }).click();
        const navigation = page.locator('.mantine-Drawer-content');
        await expect(navigation.getByRole('link')).toHaveText([
          'Practice',
          'Sets',
          'Words',
          'Words Statistics',
          'About',
        ]);
        await navigation.getByRole('link', { name: 'Practice', exact: true }).click();
        await expect(navigation).not.toBeVisible();
      } else {
        await expect(page.locator('header').getByRole('link')).toHaveText([
          'Practice',
          'Sets',
          'Words',
          'Words Statistics',
          'About',
        ]);
        await page.locator('header').getByRole('link', { name: 'Practice', exact: true }).click();
      }
      await expect(page).toHaveURL('/practice');
      await expect(page.getByRole('article')).toHaveCount(2);
      await expect(page.getByRole('article', { name: '20 random words' })).toBeVisible();
      await expect(page.getByRole('article', { name: '20 weakest words' })).toBeVisible();
      expect(selections).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.getByRole('link', { name: 'Start 20 random words', exact: true }).click();
      await expect(page).toHaveURL('/practice/open-questions/random');
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    });
  }

  for (const [index, mode] of ['random', 'weakest'].entries()) {
    test(`Alt+${index + 1} starts ${mode} practice only from the Practice page`, async ({ page }) => {
      let selections = 0;
      await page.route('**/api/practice/open-questions/*', (route) => {
        selections++;
        return route.fulfill({ json: { entries: [entry] } });
      });
      await expect(page.getByRole('heading', { name: 'Practice', exact: true })).toBeVisible();
      await page.keyboard.press(`Alt+${index + 1}`);
      await expect(page).toHaveURL(`/practice/open-questions/${mode}`);
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
      expect(selections).toBe(1);

      await page.keyboard.press(`Alt+${index === 0 ? 2 : 1}`);
      await expect(page).toHaveURL(`/practice/open-questions/${mode}`);
      await page.getByRole('button', { name: 'Go back to practice' }).click();
      await expect(page).toHaveURL('/practice');
      await page.getByRole('link', { name: 'About', exact: true }).click();
      await expect(page).toHaveURL('/about');
      await expect(page.getByRole('heading', { name: 'About LexicaNext', exact: true })).toBeVisible();
      await page.keyboard.press(`Alt+${index + 1}`);
      await expect(page).toHaveURL('/about');
      expect(selections).toBe(1);
    });
  }

  for (const mode of ['random', 'weakest']) {
    test(`${mode} starts from its card and returns to Practice`, async ({ page }) => {
      await page.route(`**/api/practice/open-questions/${mode}`, (route) =>
        route.fulfill({ json: { entries: [entry] } }),
      );
      await page.getByRole('link', { name: `Start 20 ${mode} words`, exact: true }).click();
      await expect(page).toHaveURL(`/practice/open-questions/${mode}`);
      await expect(page.getByText('0 / 1 words completed', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Go back to practice' }).click();
      await expect(page).toHaveURL('/practice');
    });

    test(`${mode} direct links return to Practice even with an old Sets return URL`, async ({ page }) => {
      await page.route(`**/api/practice/open-questions/${mode}`, (route) =>
        route.fulfill({ json: { entries: [entry] } }),
      );
      await page.goto(`/practice/open-questions/${mode}?returnTo=%2Fsets`);
      await page.getByRole('button', { name: 'Go back to practice' }).click();
      await expect(page).toHaveURL('/practice');
    });

    test(`${mode} completion returns to Practice`, async ({ page }) => {
      await page.route(`**/api/practice/open-questions/${mode}`, (route) =>
        route.fulfill({ json: { entries: [entry] } }),
      );
      await page.goto(`/practice/open-questions/${mode}?returnTo=%2Fsets`);
      for (let i = 0; i < 4; i++) {
        await answerCurrentQuestion(page);
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: /Congratulations/ })).toBeVisible();
      await page.getByRole('button', { name: 'Back', exact: true }).click();
      await expect(page).toHaveURL('/practice');
    });

    test(`${mode} resumes saved words and returns to Practice`, async ({ page }) => {
      let selections = 0;
      await page.route(`**/api/practice/open-questions/${mode}`, (route) => {
        selections++;
        return route.fulfill({ json: { entries: [entry] } });
      });
      await page.goto(`/practice/open-questions/${mode}`);
      await answerCurrentQuestion(page);
      await page.reload();
      const resumeDialog = page.getByRole('dialog', { name: 'Continue Learning?' });
      await expect(resumeDialog).toBeVisible();
      await resumeDialog.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(page).toHaveURL(`/practice/open-questions/${mode}`);
      await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
      expect(selections).toBe(1);
      await page.getByRole('button', { name: 'Go back to practice' }).click();
      await expect(page).toHaveURL('/practice');
    });

    test(`${mode} breadcrumb links to Practice`, async ({ page }) => {
      await page.route(`**/api/practice/open-questions/${mode}`, (route) =>
        route.fulfill({ json: { entries: [entry] } }),
      );
      await page.goto(`/practice/open-questions/${mode}`);
      await page.locator('main').getByRole('link', { name: 'Practice', exact: true }).click();
      await expect(page).toHaveURL('/practice');
    });

    test(`${mode} loading errors return to Practice`, async ({ page }) => {
      await page.route(`**/api/practice/open-questions/${mode}`, (route) =>
        route.fulfill({ status: 500, json: { detail: 'Practice unavailable' } }),
      );
      await page.goto(`/practice/open-questions/${mode}`);
      await expect(page).toHaveURL('/practice', { timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Practice', exact: true })).toBeVisible();
    });
  }

  test('random empty state offers adding a word and returning to Practice', async ({ page }) => {
    await page.route('**/api/practice/open-questions/random', (route) => route.fulfill({ json: { entries: [] } }));
    await page.goto('/practice/open-questions/random');
    await expect(page.getByText('Add words to start practicing', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Add word', exact: true }).click();
    await expect(page).toHaveURL('/words/new?returnTo=%2Fpractice');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL('/practice');
  });

  test('weakest empty state offers random practice', async ({ page }) => {
    await page.route('**/api/practice/open-questions/weakest', (route) => route.fulfill({ json: { entries: [] } }));
    await page.route('**/api/practice/open-questions/random', (route) => route.fulfill({ json: { entries: [entry] } }));
    await page.goto('/practice/open-questions/weakest');
    await expect(page.getByText('Practice some words first', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Start random practice', exact: true }).click();
    await expect(page).toHaveURL('/practice/open-questions/random');
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
  });
});

test.describe('signed-out practice', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of ['/', '/practice']) {
    test(`${path} shows sign-in to visitors`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL('/sign-in');
      await expect(page.getByRole('button', { name: 'Sign In to Continue' })).toBeVisible();
    });
  }
});
