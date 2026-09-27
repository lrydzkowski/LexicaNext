import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  const { isAuthenticated, isLoading, user } = useAuth0();
  const userId = isAuthenticated && !isLoading ? user?.sub : undefined;

  return <UserLayout key={userId ?? ''} userId={userId} />;
}

function UserLayout({ userId }: { userId: string | undefined }) {
  const { pathname } = useLocation();
  const [resumeSession, setResumeSession] = useState<SessionSummary | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const sessionsSnapshot = useMemo(() => findAllSessions(userId), [userId]);
  const authProcessedRef = useRef(false);

  useLayoutEffect(() => {
    notifications.clean();
  }, [pathname]);

  useEffect(() => {
    if (!userId) {
      authProcessedRef.current = false;
      setModalOpened(false);

      return;
    }

    authProcessedRef.current = true;
    if (sessionsSnapshot.length > 0) {
      setResumeSession(sessionsSnapshot[0]);
      setModalOpened(true);
    }
  }, [userId, sessionsSnapshot]);

  const focusClaimed = modalOpened || (!!userId && !authProcessedRef.current && sessionsSnapshot.length > 0);

  return (
    <FocusClaimProvider claimed={focusClaimed}>
      <GlobalShortcuts />
      <SessionResumeModal
        userId={userId}
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
    </FocusClaimProvider>
  );
}
