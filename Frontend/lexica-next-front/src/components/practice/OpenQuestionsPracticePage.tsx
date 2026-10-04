import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router';
import { ActionIcon, Alert, Button, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';
import type { OpenQuestionsEntry } from '@/learning/types';
import { showErrorNotification } from '@/services/error-notifications';
import type { EntryDto } from '../../hooks/api';
import { loadSession } from '../../services/session-storage';
import { SetOnlyOpenQuestionsMode } from '../sets/modes/SetOnlyOpenQuestionsMode';

export interface OpenQuestionsPracticePageProps {
  sessionSetId: string;
  title: string;
  emptyMessage: string;
  emptyAction: { label: string; to: string };
  usePracticeQuery: (enabled: boolean) => {
    data: EntryDto[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

export function OpenQuestionsPracticePage({
  sessionSetId,
  title,
  emptyMessage,
  emptyAction,
  usePracticeQuery,
}: OpenQuestionsPracticePageProps) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth0();
  const userId = isAuthenticated && !isAuthLoading ? user?.sub : undefined;
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(links.practice.getUrl()), [navigate]);

  const savedEntries = useMemo(
    () => loadSession<OpenQuestionsEntry>(userId, sessionSetId, 'open-questions'),
    [sessionSetId, userId],
  );
  const hasSavedSession = (savedEntries?.length ?? 0) > 0;
  const [practiceEntries, setPracticeEntries] = useState<EntryDto[] | null>(
    hasSavedSession ? (savedEntries as EntryDto[]) : null,
  );

  const { data, isLoading, error } = usePracticeQuery(!hasSavedSession);

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Practice', error);
      goBack();
    }
  }, [error, goBack]);

  useEffect(() => {
    if (!hasSavedSession && data) {
      setPracticeEntries(data);
    }
  }, [data, hasSavedSession]);

  if (!hasSavedSession && isLoading) {
    return (
      <Stack pos="relative" mih="12rem">
        <LoadingOverlay visible />
      </Stack>
    );
  }

  if (!practiceEntries) {
    return (
      <>
        <Container size="md">
          <Text>Loading practice…</Text>
        </Container>
      </>
    );
  }

  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group wrap="nowrap" w="100%">
            <ActionIcon variant="subtle" onClick={goBack} aria-label="Go back to practice">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Stack gap={0} style={{ overflow: 'hidden' }}>
              <Title order={2} size="h3">
                Open Questions Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} truncate>
                {title}
              </Text>
            </Stack>
          </Group>
          {practiceEntries.length === 0 ? (
            <Alert color="orange" title={emptyMessage}>
              <Button component={Link} to={emptyAction.to} variant="light" mt="sm">
                {emptyAction.label}
              </Button>
            </Alert>
          ) : (
            <SetOnlyOpenQuestionsMode
              entries={practiceEntries}
              sessionSetId={sessionSetId}
              title={title}
              onBack={goBack}
            />
          )}
        </Stack>
      </Container>
    </>
  );
}
