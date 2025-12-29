import { StrictMode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AppRouter } from './AppRouter';
import { AuthLoading } from './components/auth/AuthLoading';
import appConfig from './config/app-config';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications zIndex={210} />
          <Auth0Provider
            domain={appConfig.auth0Domain}
            clientId={appConfig.auth0ClientId}
            authorizationParams={{
              ...appConfig.buildGetTokenSilentlyOptions().authorizationParams,
              redirect_uri: window.location.origin,
            }}>
            <AuthLoading>
              <AppRouter />
            </AuthLoading>
          </Auth0Provider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
