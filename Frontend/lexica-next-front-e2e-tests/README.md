# LexicaNext Frontend E2E Tests

End-to-end tests for the LexicaNext frontend application using [Playwright](https://playwright.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A running instance of the LexicaNext application (frontend + backend)
- Two existing test accounts with equivalent access and configuration.

## Setup

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install chromium webkit
```

Create a `.env` file in this directory based on `.env.example` file.

Set `AUTH_EMAIL_USER_A` and `AUTH_PASSWORD_USER_A` for Chromium.

Set `AUTH_EMAIL_USER_C` and `AUTH_PASSWORD_USER_C` for WebKit.

## Running Tests

Run all tests:

```bash
npx playwright test
```

or

```bash
npm test
```

Run tests for a specific browser project:

```bash
npx playwright test --project="user-a-chromium"
```

or

```bash
npm test -- --project="user-a-chromium"
```

Run tests in headed mode (visible browser):

```bash
npx playwright test --headed
```

or

```bash
npm test -- --headed
```

## Viewing Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```

## Test Structure

- `tests/auth/` - Authentication setup for user-a and user-c
- `tests/01-home-page.spec.ts` - Home page tests
- `tests/02-about-page.spec.ts` - About page tests
- `tests/sets/` - Vocabulary set management tests (CRUD, pagination, search, study modes)
- `tests/words/` - Word management tests (CRUD, pagination, form validation)

## Configuration

Test configuration is defined in `playwright.config.ts`.

Each browser project runs the complete suite with its own equivalent account.

| Account | Browser  |
| ------- | -------- |
| user-a  | Chromium |
| user-b  | WebKit   |

The projects use these execution settings:

- Two global workers allow the browser projects to run concurrently.
- One worker per browser project keeps each account's tests sequential.
- Each account signs in through its assigned browser before its suite runs.
- Authentication state is saved separately for each account.

Only one invocation may use the account pair at a time, across all machines.

The rule includes single-project runs and has no automatic lock enforcement.
