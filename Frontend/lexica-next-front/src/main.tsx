import { StrictMode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { AppRouter } from './AppRouter.tsx';
import appConfig from './config/app-config.ts';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { AuthLoading } from './components/auth/AuthLoading.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Auth0Provider
        domain={appConfig.auth0Domain}
        clientId={appConfig.auth0ClientId}
        authorizationParams={{ redirect_uri: window.location.origin }}>
        <AuthLoading>
          <AppRouter />
        </AuthLoading>
      </Auth0Provider>
    </MantineProvider>
  </StrictMode>,
);
