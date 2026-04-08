# LexicaNext Frontend E2E Tests

End-to-end tests for the LexicaNext frontend application using [Playwright](https://playwright.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A running instance of the LexicaNext application (frontend + backend)

## Setup

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Create a `.env` file in this directory based on `.env.example` file.

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run tests for a specific user group:

```bash
npx playwright test --project="user-a-chromium"
```

Run a specific test file:

```bash
npx playwright test tests/sets/01-sets-list-page.spec.ts
```

Run tests in headed mode (visible browser):

```bash
npx playwright test --headed
```

## Viewing Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```

## Test Structure

- `tests/auth/` - Authentication setup for each user group (user-a, user-b)
- `tests/01-home-page.spec.ts` - Home page tests
- `tests/02-about-page.spec.ts` - About page tests
- `tests/sets/` - Vocabulary set management tests (CRUD, pagination, search, study modes)
- `tests/words/` - Word management tests (CRUD, pagination, form validation)

## Configuration

Test configuration is defined in `playwright.config.ts`. Tests run against three browser engines (Chromium, Firefox,
WebKit) for each user group, with sequential execution per browser to avoid state conflicts.
