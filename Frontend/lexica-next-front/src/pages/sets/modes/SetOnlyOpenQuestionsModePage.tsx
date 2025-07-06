import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SetOnlyOpenQuestionsMode } from '../../../components/sets/modes/SetOnlyOpenQuestionsMode';
import { useSet } from '../../../hooks/api';

export function SetOnlyOpenQuestionsModePage() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: set, isLoading: loading, error } = useSet(setId!);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error Loading Set',
        message: 'Failed to load set',
        color: 'red',
        position: 'top-center',
      });
      navigate('/sets');
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
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} mt="sm">
                Open Questions Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }}>
                {set.name}
              </Text>
            </div>
          </Group>
          <SetOnlyOpenQuestionsMode set={set} />
        </Stack>
      </Container>
    </>
  );
}
