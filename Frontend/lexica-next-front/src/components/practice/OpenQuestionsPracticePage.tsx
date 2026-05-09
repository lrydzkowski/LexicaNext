import { useEffect, useMemo, useState } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';
import { useReturnTo } from '@/hooks/useReturnTo';
import { showErrorNotification } from '@/services/error-notifications';
import type { EntryDto } from '../../hooks/api';
import { loadSession } from '../../services/session-storage';
import { SetOnlyOpenQuestionsMode, type OpenQuestionsEntry } from '../sets/modes/SetOnlyOpenQuestionsMode';

export interface OpenQuestionsPracticePageProps {
  sessionSetId: string;
  title: string;
  usePracticeQuery: (enabled: boolean) => {
    data: EntryDto[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

export function OpenQuestionsPracticePage({ sessionSetId, title, usePracticeQuery }: OpenQuestionsPracticePageProps) {
  const goBack = useReturnTo(links.sets.getUrl());

  const savedEntries = useMemo(() => loadSession<OpenQuestionsEntry>(sessionSetId, 'open-questions'), [sessionSetId]);
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
            <ActionIcon variant="subtle" onClick={goBack} aria-label="Go back to sets">
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
          <SetOnlyOpenQuestionsMode entries={practiceEntries} sessionSetId={sessionSetId} title={title} />
        </Stack>
      </Container>
    </>
  );
}
