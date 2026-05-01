import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, useLocation } from 'react-router';
import { AppShell, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FocusClaimProvider } from '../../contexts/FocusClaimContext';
import { findAllSessions, type SessionSummary } from '../../services/session-storage';
import { SessionResumeModal } from '../session/SessionResumeModal';
import { GlobalShortcuts } from '../shortcuts/GlobalShortcuts';
import { Header } from './Header';

export function Layout() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth0();
  const [resumeSession, setResumeSession] = useState<SessionSummary | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const sessionsSnapshot = useMemo(() => (isAuthenticated ? findAllSessions() : []), [isAuthenticated]);
  const authProcessedRef = useRef(false);

  useEffect(() => {
    notifications.clean();
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      authProcessedRef.current = false;
      setModalOpened(false);

      return;
    }

    authProcessedRef.current = true;
    if (sessionsSnapshot.length > 0) {
      setResumeSession(sessionsSnapshot[0]);
      setModalOpened(true);
    }
  }, [isAuthenticated, sessionsSnapshot]);

  const focusClaimed =
    modalOpened || (isAuthenticated && !authProcessedRef.current && sessionsSnapshot.length > 0);

  return (
    <FocusClaimProvider claimed={focusClaimed}>
      <GlobalShortcuts />
      <SessionResumeModal opened={modalOpened} session={resumeSession} onClose={() => setModalOpened(false)} />
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
    </FocusClaimProvider>
  );
}
