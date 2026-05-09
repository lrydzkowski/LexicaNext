import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useParams } from 'react-router';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';
import { useReturnTo } from '@/hooks/useReturnTo';
import { showErrorNotification } from '@/services/error-notifications';
import { SetOnlyOpenQuestionsMode } from '../../../components/sets/modes/SetOnlyOpenQuestionsMode';
import { useSet } from '../../../hooks/api';

export function SetOnlyOpenQuestionsModePage() {
  const { setId } = useParams<{ setId: string }>();
  const { data: set, isLoading: loading, error } = useSet(setId!);
  const goBack = useReturnTo(links.sets.getUrl());

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Set', error);
      goBack();
    }
  }, [error, goBack]);

  if (loading) {
    return (
      <Stack pos="relative" mih="12rem">
        <LoadingOverlay visible />
      </Stack>
    );
  }

  if (!set) {
    return (
      <>
        <Container size="md">
          <Text>Set not found</Text>
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
                {set.name}
              </Text>
            </Stack>
          </Group>
          <SetOnlyOpenQuestionsMode entries={set.entries ?? []} sessionSetId={set.setId ?? ''} title={set.name ?? ''} />
        </Stack>
      </Container>
    </>
  );
}
