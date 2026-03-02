import { Page } from '@playwright/test';
import path from 'path';

interface AuthConfig {
  email: string;
  password: string;
}

export function getAuthConfig(group: string): AuthConfig {
  const suffix = group.replace(/-/g, '_').toUpperCase();

  const email = process.env[`AUTH_EMAIL_${suffix}`];
  if (!email) {
    throw new Error(
      `AUTH_EMAIL_${suffix} environment variable is not set. Copy .env.example to .env and fill in values.`,
    );
  }

  const password = process.env[`AUTH_PASSWORD_${suffix}`];
  if (!password) {
    throw new Error(
      `AUTH_PASSWORD_${suffix} environment variable is not set. Copy .env.example to .env and fill in values.`,
    );
  }

  return { email, password };
}

export function getAuthFilePath(group: string): string {
  return path.join(__dirname, '../../playwright/.auth', `${group}.json`);
}

export async function authenticate(page: Page, config: AuthConfig): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In to Continue' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('/sets');
}
