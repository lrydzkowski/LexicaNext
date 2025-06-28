import { useEffect, useState } from 'react';
import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';
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
import { useSet, type EntryDto } from '../../../hooks/api';

interface OpenQuestionsEntry extends EntryDto {
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

type QuestionType = 'english-open' | 'native-open';

interface Question {
  entry: OpenQuestionsEntry;
  entryIndex: number;
  type: QuestionType;
  question: string;
  correctAnswer: string;
}

export function SetOnlyOpenQuestionsModePage() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: set, isLoading: loading, error } = useSet(setId!);

  const [entries, setEntries] = useState<OpenQuestionsEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (set?.entries) {
      const initialEntries = set.entries.map((entry) => ({
        ...entry,
        englishOpenCounter: 0,
        nativeOpenCounter: 0,
      }));
      setEntries(initialEntries);
      generateNextQuestion(initialEntries);
    }
  }, [set]);

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

  const generateNextQuestion = (currentEntries: OpenQuestionsEntry[]) => {
    // Randomize entries
    const shuffledEntries = [...currentEntries].sort(() => Math.random() - 0.5);

    // Find entries that still need questions
    const eligibleEntries = shuffledEntries.filter((entry) => {
      return entry.englishOpenCounter < 2 || entry.nativeOpenCounter < 2;
    });

    if (eligibleEntries.length === 0) {
      setIsComplete(true);
      return;
    }

    // Select first eligible entry
    const selectedEntry = eligibleEntries[0];
    const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

    // Determine question type
    let questionType: QuestionType;
    const availableTypes: QuestionType[] = [];

    if (selectedEntry.englishOpenCounter < 2) availableTypes.push('english-open');
    if (selectedEntry.nativeOpenCounter < 2) availableTypes.push('native-open');

    questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Generate question
    const question = generateQuestion(selectedEntry, entryIndex, questionType);
    setCurrentQuestion(question);
  };

  const generateQuestion = (entry: OpenQuestionsEntry, entryIndex: number, type: QuestionType): Question => {
    switch (type) {
      case 'english-open':
        return {
          entry,
          entryIndex,
          type,
          question: `What does "${entry.word}" mean?`,
          correctAnswer: entry.translations?.[0] || '',
        };

      case 'native-open':
        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${entry.translations?.[0] || ''}"?`,
          correctAnswer: entry.word || '',
        };

      default:
        throw new Error('Invalid question type');
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    const correct = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update counters
    const updatedEntries = [...entries];
    const entry = updatedEntries[currentQuestion.entryIndex];

    if (correct) {
      switch (currentQuestion.type) {
        case 'english-open':
          entry.englishOpenCounter += 1;
          break;
        case 'native-open':
          entry.nativeOpenCounter += 1;
          break;
      }
    } else {
      // Reset counters for this entry
      entry.englishOpenCounter = 0;
      entry.nativeOpenCounter = 0;
    }

    setEntries(updatedEntries);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    generateNextQuestion(entries);
  };

  const getProgress = () => {
    const totalRequired = entries.length * 4; // Each entry needs 4 points total (2+2)
    const currentProgress = entries.reduce((sum, entry) => {
      return sum + Math.min(entry.englishOpenCounter, 2) + Math.min(entry.nativeOpenCounter, 2);
    }, 0);

    return totalRequired > 0 ? (currentProgress / totalRequired) * 100 : 0;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && userAnswer.trim() && !showFeedback) {
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
              You've completed the open questions mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered all the words through advanced open question practice.
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

  if (!currentQuestion) {
    return (
      <>
        <Container size="md">
          <Alert color="orange" title="No questions available">
            Unable to generate questions for this set.
          </Alert>
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
                {set?.name}
              </Text>
            </div>
          </Group>

          <Progress value={getProgress()} size="lg" radius="md" />

          <Paper>
            <Stack gap="lg">
              <div>
                <Text fz={{ base: 'md', md: 'lg' }} fw={600} mb="md">
                  {currentQuestion.question}
                </Text>
                <Text size="sm" c="dimmed">
                  Word type: {currentQuestion.entry.wordType}
                </Text>
              </div>

              {!showFeedback ? (
                <Stack gap="md">
                  <TextInput
                    placeholder="Type your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    size="lg"
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />

                  <Button size="lg" onClick={checkAnswer} disabled={!userAnswer.trim()}>
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
                        The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                      </Text>
                    )}
                  </Alert>

                  <div>
                    <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                      {currentQuestion.entry.word}
                    </Text>
                    <Text c="dimmed" size="sm">
                      ({currentQuestion.entry.wordType})
                    </Text>
                    <Text mt="sm" fz={{ base: 'sm', md: 'md' }}>
                      <strong>Translations:</strong> {(currentQuestion.entry.translations || []).join(', ')}
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
