import { Outlet } from 'react-router';
import { AppShell, Container } from '@mantine/core';
import { Header } from './Header';

export function Layout() {
  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <Container size="md">
          <Header />
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
