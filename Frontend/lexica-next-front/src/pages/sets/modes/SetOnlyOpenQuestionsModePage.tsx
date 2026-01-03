import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { links } from '@/config/links';
import { SetOnlyOpenQuestionsMode } from '../../../components/sets/modes/SetOnlyOpenQuestionsMode';
import { useSet } from '../../../hooks/api';

export function SetOnlyOpenQuestionsModePage() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: set, isLoading: loading, error } = useSet(setId!);
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error Loading Set',
        message: 'Failed to load set',
        color: 'red',
        position: 'top-center',
        autoClose: false,
      });
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
            <ActionIcon
              variant="subtle"
              onClick={() => navigate(links.sets.getUrl({}, { returnPage }))}
              aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Stack gap={0} style={{ overflow: 'hidden' }}>
              <Title order={2} mt="sm">
                Open Questions Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} truncate>
                {set.name}
              </Text>
            </Stack>
          </Group>
          <SetOnlyOpenQuestionsMode set={set} />
        </Stack>
      </Container>
    </>
  );
}
