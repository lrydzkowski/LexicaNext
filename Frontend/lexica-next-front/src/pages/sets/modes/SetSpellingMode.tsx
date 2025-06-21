import { useEffect, useState } from 'react';
import { IconArrowLeft, IconCheck, IconVolume, IconX } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type EntryDto } from '../../../services/api';

interface SpellingEntry extends EntryDto {
  counter: number;
}

export function SetSpellingMode() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [setName, setSetName] = useState('');
  const [entries, setEntries] = useState<SpellingEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchSet = async () => {
      if (!setId) return;

      try {
        const set = await api.getSet(setId);
        setSetName(set.name);

        // Randomize entries and add counters
        const shuffledEntries = [...set.entries]
          .sort(() => Math.random() - 0.5)
          .map((entry) => ({ ...entry, counter: 0 }));

        setEntries(shuffledEntries);
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

  const playAudio = async () => {
    if (entries.length === 0) return;

    const currentEntry = entries[currentEntryIndex];
    try {
      // This is a mock implementation. In a real app, you'd use the actual audio API
      const audioUrl = await api.getRecording(currentEntry.word, currentEntry.wordType);

      // For demo purposes, we'll use speech synthesis
      const utterance = new SpeechSynthesisUtterance(currentEntry.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const checkAnswer = () => {
    const currentEntry = entries[currentEntryIndex];
    const correct = userInput.trim().toLowerCase() === currentEntry.word.toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

    // Update counter
    const updatedEntries = [...entries];
    if (correct) {
      updatedEntries[currentEntryIndex].counter += 1;
    } else {
      updatedEntries[currentEntryIndex].counter = 0;
    }
    setEntries(updatedEntries);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserInput('');

    // Find next entry or check if complete
    const remainingEntries = entries.filter((entry) => entry.counter < 2);

    if (remainingEntries.length === 0) {
      setIsComplete(true);
      return;
    }

    // Randomize remaining entries and pick next one
    const shuffled = remainingEntries.sort(() => Math.random() - 0.5);
    const nextEntry = shuffled[0];
    const nextIndex = entries.findIndex((entry) => entry.word === nextEntry.word);
    setCurrentEntryIndex(nextIndex);
  };

  const getProgress = () => {
    const completedEntries = entries.filter((entry) => entry.counter >= 2).length;
    return entries.length > 0 ? (completedEntries / entries.length) * 100 : 0;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && userInput.trim() && !showFeedback) {
      checkAnswer();
    }
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (isComplete) {
    return (
      <>
        <Container size="md">
          <Stack gap="lg" align="center" py="xl">
            <Title order={1} ta="center" c="green" fz={{ base: 'h2', md: 'h1' }}>
              🎉 Congratulations!
            </Title>
            <Text fz={{ base: 'md', md: 'lg' }} ta="center">
              You've completed the spelling mode for "{setName}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've successfully learned the spelling of all words in this set.
            </Text>
            <Group wrap="wrap" justify="center">
              <Button variant="light" onClick={() => navigate('/sets')} size="md">
                Back to Sets
              </Button>
              <Button onClick={() => window.location.reload()} size="md">
                Practice Again
              </Button>
            </Group>
          </Stack>
        </Container>
      </>
    );
  }

  if (entries.length === 0) {
    return (
      <>
        <Container size="md">
          <Alert color="orange" title="No entries found">
            This set doesn't contain any vocabulary entries.
          </Alert>
        </Container>
      </>
    );
  }

  const currentEntry = entries[currentEntryIndex];

  return (
    <>
      <Container size="md">
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} mb="sm" mt="sm">
                Spelling Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }}>
                {setName}
              </Text>
            </div>
          </Group>

          <Progress value={getProgress()} size="lg" radius="md" />
          <Text size="sm" c="dimmed" ta="center">
            {entries.filter((e) => e.counter >= 2).length} / {entries.length} words completed
          </Text>

          <Paper ta="center">
            <Stack gap="lg">
              <div>
                <Text fz={{ base: 'md', md: 'lg' }} mb="md">
                  Listen and spell the word:
                </Text>
                <ActionIcon
                  size="xl"
                  variant="filled"
                  color="blue"
                  onClick={playAudio}
                  style={{ margin: '0 auto' }}
                  aria-label="Play pronunciation">
                  <IconVolume size={24} />
                </ActionIcon>
                <Text size="sm" c="dimmed" mt="sm">
                  Click to hear the pronunciation
                </Text>
              </div>

              {!showFeedback ? (
                <Stack gap="md">
                  <TextInput
                    placeholder="Type the word you heard..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    size="lg"
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <Button size="lg" onClick={checkAnswer} disabled={!userInput.trim()}>
                    Check Answer
                  </Button>
                </Stack>
              ) : (
                <Stack gap="md">
                  <Alert
                    color={isCorrect ? 'green' : 'red'}
                    icon={isCorrect ? <IconCheck size={16} /> : <IconX size={16} />}
                    title={isCorrect ? 'Correct!' : 'Incorrect'}>
                    {!isCorrect && (
                      <Text>
                        The correct spelling is: <strong>{currentEntry.word}</strong>
                      </Text>
                    )}
                  </Alert>

                  <div>
                    <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                      {currentEntry.word}
                    </Text>
                    <Text c="dimmed" size="sm">
                      ({currentEntry.wordType})
                    </Text>
                    <Text mt="sm" fz={{ base: 'sm', md: 'md' }}>
                      <strong>Translations:</strong> {currentEntry.translations.join(', ')}
                    </Text>
                  </div>

                  <Button size="lg" onClick={nextQuestion} autoFocus>
                    Continue
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
