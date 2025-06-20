import { useEffect, useState } from 'react';
import { IconArrowLeft, IconVolume } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Badge,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type GetSetResponse } from '../../services/api';

export function SetContent() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [set, setSet] = useState<GetSetResponse | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      if (!setId) return;

      try {
        const setData = await api.getSet(setId);
        setSet(setData);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to load set',
          color: 'red',
        });
        navigate('/sets');
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [setId]);

  const playAudio = async (word: string /*, wordType: string*/) => {
    try {
      // Mock implementation using speech synthesis
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

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

          <Paper>
            <Group justify="space-between" mb="lg" wrap="wrap">
              <Text fz={{ base: 'md', md: 'lg' }} fw={600}>
                Vocabulary List
              </Text>
              <Badge size="lg" variant="light">
                {set.entries.length} words
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {set.entries.map((entry, index) => (
                <Card key={index} withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" wrap="nowrap">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c="blue" truncate>
                          {entry.word}
                        </Text>
                        <Badge size="sm" color={getWordTypeColor(entry.wordType)} variant="light">
                          {entry.wordType}
                        </Badge>
                      </div>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => playAudio(entry.word /*, entry.wordType*/)}
                        aria-label={`Play pronunciation of ${entry.word}`}
                        style={{ flexShrink: 0 }}>
                        <IconVolume size={16} />
                      </ActionIcon>
                    </Group>

                    <div>
                      <Text size="sm" c="dimmed" fw={500} mb="xs">
                        Translations:
                      </Text>
                      <Stack gap="xs">
                        {entry.translations.map((translation, translationIndex) => (
                          <Text key={translationIndex} size="sm">
                            • {translation}
                          </Text>
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>

          <Card withBorder>
            <Stack gap="md">
              <Text fz={{ base: 'md', md: 'lg' }} fw={600}>
                Set Information
              </Text>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Created:
                </Text>
                <Text size="sm">
                  {new Date(set.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Group>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Total Words:
                </Text>
                <Text size="sm">{set.entries.length}</Text>
              </Group>
              <Group wrap="wrap">
                <Text size="sm" c="dimmed">
                  Word Types:
                </Text>
                <Group gap="xs" wrap="wrap">
                  {Array.from(new Set(set.entries.map((e) => e.wordType))).map((type) => (
                    <Badge key={type} size="sm" color={getWordTypeColor(type)} variant="light">
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
