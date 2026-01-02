import { Outlet } from 'react-router';
import { AppShell, Container } from '@mantine/core';
import { Header } from './Header';

export function Layout() {
  return (
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
  );
}
