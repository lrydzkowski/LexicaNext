import type { GetTokenSilentlyOptions } from '@auth0/auth0-react';
import createFetchClient from 'openapi-fetch';
import type { paths } from '../../api-types/api-types';
import appConfig from '../config/app-config';
import { isReauthRequiredError } from './auth-session';

const baseUrl = appConfig.apiBasePath;

export const createAuthenticatedClient = (
  getAccessToken: (params?: GetTokenSilentlyOptions) => Promise<string>,
  onAuthError: () => void,
) => {
  const client = createFetchClient<paths>({ baseUrl });

  client.use({
    async onRequest({ request }) {
      try {
        const token = await getAccessToken(appConfig.buildGetTokenSilentlyOptions());
        request.headers.set('Authorization', `Bearer ${token}`);
        return request;
      } catch (error) {
        if (isReauthRequiredError(error)) {
          onAuthError();
        }

        throw error;
      }
    },
    onResponse({ response }) {
      if (response.status === 401) {
        onAuthError();
      }
    },
  });

  return client;
};

export const createUnauthenticatedClient = () => {
  return createFetchClient<paths>({ baseUrl });
};
