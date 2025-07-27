import { useEffect, useState } from 'react';
import { IconCheck, IconVolume, IconX } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { type EntryDto, type GetSetResponse } from '../../../hooks/api';
import { usePronunciation } from '../../../hooks/usePronunciation';

interface SpellingEntry extends EntryDto {
  counter: number;
}

export interface SetSpellingModeProps {
  set: GetSetResponse;
}

export function SetSpellingMode({ set }: SetSpellingModeProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const [entries, setEntries] = useState<SpellingEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [iteration, setIteration] = useState(0);

  const currentEntry = entries[currentEntryIndex];
  const {
    playAudio,
    isLoading: pronunciationLoading,
    error: pronunciationError,
  } = usePronunciation(currentEntry?.word || '', currentEntry?.wordType, {
    autoPlay: false,
    enabled: currentEntry != null,
  });

  useEffect(() => {
    if (set?.entries) {
      const shuffledEntries = [...set.entries]
        .sort(() => Math.random() - 0.5)
        .map((entry) => ({ ...entry, counter: 0 }));
      setEntries(shuffledEntries);
    }
  }, [set]);

  useEffect(() => {
    const totalPossiblePoints = entries.length * 2;
    const currentPoints = entries.reduce((sum, entry) => sum + Math.min(entry.counter, 2), 0);
    const progressValue = totalPossiblePoints > 0 ? (currentPoints / totalPossiblePoints) * 100 : 0;

    const completed = entries.filter((entry) => entry.counter >= 2).length;

    setProgress(progressValue);
    setCompletedCount(completed);
  }, [entries]);

  useEffect(() => {
    if (currentEntry) {
      if (pronunciationError) {
        console.error('Pronunciation error:', pronunciationError);

        const updatedEntries = [...entries];
        updatedEntries[currentEntryIndex].counter = 2;
        setEntries(updatedEntries);
        nextQuestion();

        return;
      }

      const timer = setTimeout(() => {
        playAudio();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentEntry, iteration, playAudio, pronunciationError]);

  const checkAnswer = () => {
    const currentEntry = entries[currentEntryIndex];
    const correct = userInput.trim().toLowerCase() === (currentEntry.word || '').toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

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

    const remainingEntries = entries.filter((entry) => entry.counter < 2);

    if (remainingEntries.length === 0) {
      setIsComplete(true);
      return;
    }

    const shuffled = remainingEntries.sort(() => Math.random() - 0.5);
    const nextEntry = shuffled[0];
    const nextIndex = entries.findIndex((entry) => entry.word === nextEntry.word);
    setCurrentEntryIndex(nextIndex);
    setIteration((prev) => prev + 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && userInput.trim() && !showFeedback) {
      event.preventDefault();
      checkAnswer();
    }
  };

  if (isComplete) {
    return (
      <>
        <Container size="md">
          <Stack gap="lg" align="center" py="xl">
            <Title order={1} ta="center" c="green" fz={{ base: 'h2', md: 'h1' }}>
              🎉 Congratulations!
            </Title>
            <Text fz={{ base: 'md', md: 'lg' }} ta="center">
              You've completed the spelling mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've successfully learned the spelling of all words in this set.
            </Text>
            <Group wrap="wrap" justify="center">
              <Button variant="light" onClick={() => navigate(`/sets?page=${returnPage}`)} size="md" autoFocus>
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

  return (
    <>
      <Stack gap="lg">
        <Progress value={progress} size="lg" radius="md" />
        <Text size="sm" c="dimmed" ta="center">
          {completedCount} / {entries.length} words completed
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
                loading={pronunciationLoading}
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
                    <strong>Translations:</strong> {(currentEntry.translations || []).join(', ')}
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
    </>
  );
}
