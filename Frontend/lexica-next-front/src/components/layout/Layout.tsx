import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, useLocation } from 'react-router';
import { AppShell, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { type SessionSummary, findAllSessions } from '../../services/session-storage';
import { SessionResumeModal } from '../session/SessionResumeModal';
import { GlobalShortcuts } from '../shortcuts/GlobalShortcuts';
import { Header } from './Header';

export function Layout() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth0();
  const [resumeSession, setResumeSession] = useState<SessionSummary | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    notifications.clean();
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const sessions = findAllSessions();
    if (sessions.length > 0) {
      setResumeSession(sessions[0]);
      setModalOpened(true);
    }
  }, [isAuthenticated]);

  return (
    <>
      <GlobalShortcuts />
      <SessionResumeModal
        opened={modalOpened}
        session={resumeSession}
        onClose={() => setModalOpened(false)}
      />
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
