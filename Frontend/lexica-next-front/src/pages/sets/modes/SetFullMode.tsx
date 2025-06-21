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
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type EntryDto } from '../../../services/api';

interface FullModeEntry extends EntryDto {
  englishCloseCounter: number;
  nativeCloseCounter: number;
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

type QuestionType = 'english-close' | 'native-close' | 'english-open' | 'native-open';

interface Question {
  entry: FullModeEntry;
  entryIndex: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
}

export function SetFullMode() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [setName, setSetName] = useState('');
  const [entries, setEntries] = useState<FullModeEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchSet = async () => {
      if (!setId) return;

      try {
        const set = await api.getSet(setId);
        setSetName(set.name);

        // Initialize entries with counters
        const initialEntries = set.entries.map((entry) => ({
          ...entry,
          englishCloseCounter: 0,
          nativeCloseCounter: 0,
          englishOpenCounter: 0,
          nativeOpenCounter: 0,
        }));

        setEntries(initialEntries);
        generateNextQuestion(initialEntries);
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

  const generateNextQuestion = (currentEntries: FullModeEntry[]) => {
    // Get 7 random entries (or all if less than 7)
    const shuffledEntries = [...currentEntries].sort(() => Math.random() - 0.5);
    const selectedEntries = shuffledEntries.slice(0, Math.min(7, shuffledEntries.length));

    // Find entries that still need questions
    const eligibleEntries = selectedEntries.filter((entry) => {
      return (
        entry.englishCloseCounter < 1 ||
        entry.nativeCloseCounter < 1 ||
        entry.englishOpenCounter < 2 ||
        entry.nativeOpenCounter < 2
      );
    });

    if (eligibleEntries.length === 0) {
      // Check if all entries are complete
      const allComplete = currentEntries.every(
        (entry) =>
          entry.englishCloseCounter >= 1 &&
          entry.nativeCloseCounter >= 1 &&
          entry.englishOpenCounter >= 2 &&
          entry.nativeOpenCounter >= 2,
      );

      if (allComplete) {
        setIsComplete(true);
        return;
      }

      // Retry with different random selection
      generateNextQuestion(currentEntries);
      return;
    }

    // Select random eligible entry
    const selectedEntry = eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
    const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

    // Determine question type
    let questionType: QuestionType;
    const availableTypes: QuestionType[] = [];

    if (selectedEntry.englishCloseCounter < 1) availableTypes.push('english-close');
    if (selectedEntry.nativeCloseCounter < 1) availableTypes.push('native-close');
    if (availableTypes.length === 0) {
      if (selectedEntry.englishOpenCounter < 2) availableTypes.push('english-open');
      if (selectedEntry.nativeOpenCounter < 2) availableTypes.push('native-open');
    }

    questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Generate question based on type
    const question = generateQuestion(selectedEntry, entryIndex, questionType, currentEntries);
    setCurrentQuestion(question);
  };

  const generateQuestion = (
    entry: FullModeEntry,
    entryIndex: number,
    type: QuestionType,
    allEntries: FullModeEntry[],
  ): Question => {
    switch (type) {
      case 'english-close':
        // Multiple choice: English word -> native translation
        const correctTranslation = entry.translations[0];
        const wrongOptions = allEntries
          .filter((e) => e.word !== entry.word)
          .flatMap((e) => e.translations)
          .filter((t) => t !== correctTranslation)
          .slice(0, 3);

        const options = [correctTranslation, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
          entry,
          entryIndex,
          type,
          question: `What does "${entry.word}" mean?`,
          options,
          correctAnswer: correctTranslation,
        };

      case 'native-close':
        // Multiple choice: native translation -> English word
        const correctWord = entry.word;
        const wrongWords = allEntries
          .filter((e) => e.word !== entry.word)
          .map((e) => e.word)
          .slice(0, 3);

        const wordOptions = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);

        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${entry.translations[0]}"?`,
          options: wordOptions,
          correctAnswer: correctWord,
        };

      case 'english-open':
        // Open question: English word -> native translation
        return {
          entry,
          entryIndex,
          type,
          question: `What does "${entry.word}" mean? (Type your answer)`,
          correctAnswer: entry.translations[0],
        };

      case 'native-open':
        // Open question: native translation -> English word
        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${entry.translations[0]}"? (Type your answer)`,
          correctAnswer: entry.word,
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
        case 'english-close':
          entry.englishCloseCounter += 1;
          break;
        case 'native-close':
          entry.nativeCloseCounter += 1;
          break;
        case 'english-open':
          entry.englishOpenCounter += 1;
          break;
        case 'native-open':
          entry.nativeOpenCounter += 1;
          break;
      }
    } else {
      // Reset all counters for this entry
      entry.englishCloseCounter = 0;
      entry.nativeCloseCounter = 0;
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
    const totalRequired = entries.length * 6; // Each entry needs 6 points total (1+1+2+2)
    const currentProgress = entries.reduce((sum, entry) => {
      return (
        sum +
        Math.min(entry.englishCloseCounter, 1) +
        Math.min(entry.nativeCloseCounter, 1) +
        Math.min(entry.englishOpenCounter, 2) +
        Math.min(entry.nativeOpenCounter, 2)
      );
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
              You've completed the full mode for "{setName}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered all the words in this set through comprehensive practice.
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
      <Container size="md">
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} mb="sm" mt="sm">
                Full Mode
              </Title>
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }}>
                {setName}
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
                  {currentQuestion.options ? (
                    // Multiple choice question
                    <Radio.Group value={userAnswer} onChange={setUserAnswer}>
                      <Stack gap="sm">
                        {currentQuestion.options.map((option, index) => (
                          <Radio key={index} value={option} label={option} size="md" />
                        ))}
                      </Stack>
                    </Radio.Group>
                  ) : (
                    // Open question
                    <TextInput
                      placeholder="Type your answer..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      size="lg"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  )}

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
                      <strong>Translations:</strong> {currentQuestion.entry.translations.join(', ')}
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
