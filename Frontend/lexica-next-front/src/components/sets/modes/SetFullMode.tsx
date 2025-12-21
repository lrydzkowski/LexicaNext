import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert, Button, Container, Group, Paper, Progress, Radio, Stack, Text, TextInput, Title } from '@mantine/core';
import { compareAnswers, serialize } from '@/utils/utils';
import { type EntryDto, type GetSetResponse } from '../../../hooks/api';
import { usePronunciation } from '../../../hooks/usePronunciation';

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
  correctAnswers: string[];
}

export interface SetFullModeProps {
  set: GetSetResponse;
}

export function SetFullMode({ set }: SetFullModeProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const [entries, setEntries] = useState<FullModeEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const optionsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { playAudio } = usePronunciation(currentQuestion?.entry.word || '', currentQuestion?.entry.wordType, {
    autoPlay: false,
    enabled: !!currentQuestion?.entry.word,
  });

  useEffect(() => {
    if (set?.entries) {
      const initialEntries = set.entries.map((entry) => ({
        ...entry,
        englishCloseCounter: 0,
        nativeCloseCounter: 0,
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

  const generateNextQuestion = (currentEntries: FullModeEntry[]) => {
    const shuffledEntries = [...currentEntries].sort(() => Math.random() - 0.5);
    const selectedEntries = shuffledEntries.slice(0, Math.min(7, shuffledEntries.length));

    const eligibleEntries = selectedEntries.filter((entry) => {
      return (
        entry.englishCloseCounter < 1 ||
        entry.nativeCloseCounter < 1 ||
        entry.englishOpenCounter < 2 ||
        entry.nativeOpenCounter < 2
      );
    });

    if (eligibleEntries.length === 0) {
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

      generateNextQuestion(currentEntries);
      return;
    }

    const selectedEntry = eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
    const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

    const availableTypes: QuestionType[] = [];

    if (selectedEntry.englishCloseCounter < 1) {
      availableTypes.push('english-close');
    }

    if (selectedEntry.nativeCloseCounter < 1) {
      availableTypes.push('native-close');
    }

    if (availableTypes.length === 0) {
      if (selectedEntry.englishOpenCounter < 2) {
        availableTypes.push('english-open');
      }

      if (selectedEntry.nativeOpenCounter < 2) {
        availableTypes.push('native-open');
      }
    }

    const questionType: QuestionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
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
      case 'english-close': {
        const correctTranslation = entry.translations ?? [];
        const wrongOptions = allEntries
          .filter((e) => e.word !== entry.word)
          .flatMap((e) => serialize(e.translations))
          .slice(0, 3);

        const options = [serialize(correctTranslation), ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
          entry,
          entryIndex,
          type,
          question: `What does "${entry.word}" mean?`,
          options,
          correctAnswers: correctTranslation,
        };
      }

      case 'native-close': {
        const correctWord = entry.word;
        const wrongWords = allEntries
          .filter((e) => e.word !== entry.word)
          .map((e) => e.word || '')
          .filter((word) => word !== '')
          .slice(0, 3);

        const wordOptions = [correctWord || '', ...wrongWords].sort(() => Math.random() - 0.5);

        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${serialize(entry.translations)}"?`,
          options: wordOptions,
          correctAnswers: correctWord ? [correctWord] : [],
        };
      }

      case 'english-open':
        return {
          entry,
          entryIndex,
          type,
          question: `What does "${entry.word}" mean? (Type your answer)`,
          correctAnswers: entry.translations ?? [],
        };

      case 'native-open':
        return {
          entry,
          entryIndex,
          type,
          question: `What is the English word for "${serialize(entry.translations)}"? (Type your answer)`,
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
    const totalRequired = entries.length * 6;
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
    if (showFeedback) {
      return;
    }

    if (currentQuestion?.options) {
      const numKey = parseInt(event.key, 10);
      if (numKey >= 1 && numKey <= currentQuestion.options.length) {
        event.preventDefault();
        const selectedOption = currentQuestion.options[numKey - 1];
        setUserAnswer(selectedOption);
        optionsRef.current[numKey - 1]?.focus();

        return;
      }

      if (event.key === 'Enter' && userAnswer.trim()) {
        event.preventDefault();
        checkAnswer();
      }

      return;
    }

    if (event.key === 'Enter' && userAnswer.trim()) {
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
              You've completed the full mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered all the words in this set through comprehensive practice.
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

        <Paper onKeyDown={handleKeyDown}>
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
                  <Radio.Group value={userAnswer} onChange={setUserAnswer}>
                    <Stack gap="sm">
                      {currentQuestion.options.map((option, index) => (
                        <Radio
                          key={index}
                          value={option}
                          label={`${index + 1}. ${option}`}
                          size="md"
                          autoFocus={index === 0}
                          ref={(el) => {
                            optionsRef.current[index] = el;
                          }}
                        />
                      ))}
                    </Stack>
                  </Radio.Group>
                ) : (
                  <TextInput
                    placeholder="Type your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    size="lg"
                    autoFocus
                    spellCheck="true"
                    lang={currentQuestion.type === 'native-open' ? 'en' : 'pl'}
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
                      The correct answer is: <strong>{serialize(currentQuestion.correctAnswers)}</strong>
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
