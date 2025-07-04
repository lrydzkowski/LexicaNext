import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Badge,
  Card,
  Container,
  Group,
  LoadingOverlay,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useSet } from '../../hooks/api';
import { formatDateTime } from '../../utils/date';
import { WordCard } from './WordCard';

export function SetContent() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: set, isLoading: loading, error } = useSet(setId!);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load set',
        color: 'red',
      });
      navigate('/sets');
    }
  }, [error, navigate]);

  const getWordTypeColor = (wordType: string) => {
    switch (wordType.toLowerCase()) {
      case 'noun':
        return 'blue';
      case 'verb':
        return 'green';
      case 'adjective':
        return 'orange';
      case 'adverb':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return <LoadingOverlay visible />;
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
                Content Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }}>
                {set.name}
              </Text>
            </div>
          </Group>

          <Group justify="space-between" mb="lg" wrap="wrap">
            <Text fz={{ base: 'md', md: 'lg' }} fw={600}>
              Vocabulary List
            </Text>
            <Badge size="lg" variant="light">
              {set.entries?.length || 0} words
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {(set.entries || []).map((entry, index) => (
              <WordCard key={index} entry={entry} index={index} />
            ))}
          </SimpleGrid>

          <Card withBorder>
            <Stack gap="md">
              <Text fz={{ base: 'md', md: 'lg' }} fw={600}>
                Set Information
              </Text>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Created:
                </Text>
                <Text size="sm">{formatDateTime(set.createdAt)}</Text>
              </Group>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Total Words:
                </Text>
                <Text size="sm">{set.entries?.length || 0}</Text>
              </Group>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Word Types:
                </Text>
                <Group gap="xs" wrap="wrap">
                  {Array.from(new Set((set.entries || []).map((e) => e.wordType))).map((type) => (
                    <Badge key={type} size="sm" color={getWordTypeColor(type || '')} variant="light">
                      {type}
                    </Badge>
                  ))}
                </Group>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
