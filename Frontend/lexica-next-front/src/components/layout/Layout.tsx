import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppShell, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { GlobalShortcuts } from '../shortcuts/GlobalShortcuts';
import { Header } from './Header';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    notifications.clean();
  }, [pathname]);

  return (
    <>
      <GlobalShortcuts />
      <AppShell header={{ height: 70 }} padding="md" miw={320}>
        <AppShell.Header px="md">
          <Container size="md" p={0}>
            <Header />
          </Container>
        </AppShell.Header>
        <AppShell.Main>
          <Container size="md" p={0}>
            <Outlet />
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
