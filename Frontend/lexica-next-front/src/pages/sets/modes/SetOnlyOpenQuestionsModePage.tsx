import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';
import { showErrorNotification } from '@/services/error-notifications';
import { SetOnlyOpenQuestionsMode } from '../../../components/sets/modes/SetOnlyOpenQuestionsMode';
import { useSet } from '../../../hooks/api';

export function SetOnlyOpenQuestionsModePage() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: set, isLoading: loading, error } = useSet(setId!);
  const returnTo = searchParams.get('returnTo');
  const backUrl = returnTo && returnTo.startsWith('/') ? returnTo : links.sets.getUrl();

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Set', error);
      navigate(links.sets.getUrl());
    }
  }, [error, navigate]);

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
            <ActionIcon variant="subtle" onClick={() => navigate(backUrl)} aria-label="Go back to sets">
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
          <SetOnlyOpenQuestionsMode
            entries={set.entries ?? []}
            sessionSetId={set.setId ?? ''}
            title={set.name ?? ''}
            backUrl={backUrl}
          />
        </Stack>
      </Container>
    </>
  );
}
