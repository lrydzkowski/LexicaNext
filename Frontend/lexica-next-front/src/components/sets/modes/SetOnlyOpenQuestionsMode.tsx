import { useEffect, useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert, Button, Container, Group, Paper, Progress, Stack, Text, TextInput, Title } from '@mantine/core';
import { compareAnswers, serialize } from '@/utils/utils';
import { type EntryDto, type GetSetResponse } from '../../../hooks/api';
import { usePronunciation } from '../../../hooks/usePronunciation';

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
  correctAnswers: string[];
}

export interface SetOnlyOpenQuestionsModeProps {
  set: GetSetResponse;
}

export function SetOnlyOpenQuestionsMode({ set }: SetOnlyOpenQuestionsModeProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const [entries, setEntries] = useState<OpenQuestionsEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { playAudio } = usePronunciation(currentQuestion?.entry.word || '', currentQuestion?.entry.wordType, {
    autoPlay: false,
    enabled: !!currentQuestion?.entry.word,
  });

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
    if (showFeedback && currentQuestion) {
      const timer = setTimeout(() => {
        playAudio();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, currentQuestion, playAudio]);

  const generateNextQuestion = (currentEntries: OpenQuestionsEntry[]) => {
    const shuffledEntries = [...currentEntries].sort(() => Math.random() - 0.5);

    const eligibleEntries = shuffledEntries.filter((entry) => {
      return entry.englishOpenCounter < 2 || entry.nativeOpenCounter < 2;
    });

    if (eligibleEntries.length === 0) {
      setIsComplete(true);
      return;
    }

    const selectedEntry = eligibleEntries[0];
    const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

    const availableTypes: QuestionType[] = [];

    if (selectedEntry.englishOpenCounter < 2) {
      availableTypes.push('english-open');
    }

    if (selectedEntry.nativeOpenCounter < 2) {
      availableTypes.push('native-open');
    }

    const questionType: QuestionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
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
          correctAnswers: entry.translations ?? [],
        };

      case 'native-open':
        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${serialize(entry.translations)}"?`,
          correctAnswers: entry.word ? [entry.word] : [],
        };

      default:
        throw new Error('Invalid question type');
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) {
      return;
    }

    const isCorrect = compareAnswers(userAnswer, currentQuestion.correctAnswers);

    setIsCorrect(isCorrect);
    setShowFeedback(true);

    const updatedEntries = [...entries];
    const entry = updatedEntries[currentQuestion.entryIndex];

    if (isCorrect) {
      switch (currentQuestion.type) {
        case 'english-open':
          entry.englishOpenCounter += 1;
          break;
        case 'native-open':
          entry.nativeOpenCounter += 1;
          break;
      }
    } else {
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
    const totalRequired = entries.length * 4;
    const currentProgress = entries.reduce((sum, entry) => {
      return sum + Math.min(entry.englishOpenCounter, 2) + Math.min(entry.nativeOpenCounter, 2);
    }, 0);

    return totalRequired > 0 ? (currentProgress / totalRequired) * 100 : 0;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !showFeedback) {
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
              You've completed the open questions mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered all the words through advanced open question practice.
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
      <Stack gap="lg">
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
                  spellCheck
                  lang={currentQuestion.type === 'native-open' ? 'en' : 'pl'}
                />

                <Button size="lg" onClick={checkAnswer}>
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
                    <>
                      <Text>
                        Your answer is: <strong>{userAnswer}</strong>
                      </Text>
                      <Text>
                        The correct answer is: <strong>{serialize(currentQuestion.correctAnswers)}</strong>
                      </Text>
                    </>
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
                    <strong>Translations:</strong> {serialize(currentQuestion.entry.translations)}
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
