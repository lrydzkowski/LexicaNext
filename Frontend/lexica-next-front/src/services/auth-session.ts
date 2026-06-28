import type { RedirectLoginOptions } from '@auth0/auth0-react';

const reauthRequiredErrorCodes = ['login_required', 'consent_required', 'invalid_grant', 'missing_refresh_token'];

export const isReauthRequiredError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const code = (error as { error?: unknown }).error;

  return typeof code === 'string' && reauthRequiredErrorCodes.includes(code);
};

let isRedirecting = false;

export const redirectToLogin = (loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>): void => {
  if (isRedirecting) {
    return;
  }

  isRedirecting = true;
  void loginWithRedirect().catch(() => {
    isRedirecting = false;
  });
};
