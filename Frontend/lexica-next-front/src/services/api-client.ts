import type { AuthorizationParams } from '@auth0/auth0-react';
import createFetchClient from 'openapi-fetch';
import type { paths } from '../../api-types/api-types';
import appConfig from '../config/app-config';

const baseUrl = appConfig.apiBasePath;

export const createAuthenticatedClient = (getAccessToken: (params: AuthorizationParams) => Promise<string>) => {
  const client = createFetchClient<paths>({ baseUrl });

  client.use({
    async onRequest({ request }) {
      try {
        const token = await getAccessToken(appConfig.getAuthorizationParams());
        request.headers.set('Authorization', `Bearer ${token}`);
      } catch (error) {
        console.error('Failed to get access token:', error);
      }

      return request;
    },
  });

  return client;
};

export const createUnauthenticatedClient = () => {
  return createFetchClient<paths>({ baseUrl });
};
