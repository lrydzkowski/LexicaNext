import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ActionIcon, Container, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';
import { showErrorNotification } from '@/services/error-notifications';
import { SetContent } from '../../components/sets/SetContent';
import { useSet } from '../../hooks/api';

export function SetContentPage() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: set, isLoading: loading, error } = useSet(setId!);
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

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
            <ActionIcon
              variant="subtle"
              onClick={() => navigate(links.sets.getUrl({}, { returnPage }))}
              aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Stack gap={0} style={{ overflow: 'hidden' }}>
              <Title order={2} mt="sm">
                Content Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} truncate>
                {set.name}
              </Text>
            </Stack>
          </Group>
          <SetContent set={set} />
        </Stack>
      </Container>
    </>
  );
}
