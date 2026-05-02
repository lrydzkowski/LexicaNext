import { useEffect, useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert, Button, Container, Group, Paper, Progress, Stack, Text, TextInput, Title } from '@mantine/core';
import { links } from '@/config/links';
import { serialize } from '@/utils/utils';
import { useRegisterAnswer, type EntryDto, type GetSetResponse } from '../../../hooks/api';
import { usePronunciation } from '../../../hooks/usePronunciation';
import { clearSession, loadSession, saveSession, validateSession } from '../../../services/session-storage';
import { ExampleSentences } from '../ExampleSentences';

const MAX_SENTENCES_PER_ENTRY = 5;
const MASTERY_THRESHOLD = 2;
const BLANK_PLACEHOLDER = '_____';

export interface SentencesEntry extends EntryDto {
  selectedSentenceIndices: number[];
  sentenceCounters: Record<number, number>;
}

interface Question {
  entry: SentencesEntry;
  entryIndex: number;
  sentenceIndex: number;
  originalSentence: string;
  sentenceWithBlank: string;
}

export interface SetSentencesModeProps {
  set: GetSetResponse;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildWholeWordRegex(word: string, flags: string): RegExp {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, flags);
}

function sentenceContainsWord(sentence: string, word: string): boolean {
  if (!word) {
    return false;
  }

  return buildWholeWordRegex(word, 'i').test(sentence);
}

function buildSentenceWithBlank(sentence: string, word: string): string {
  return sentence.replace(buildWholeWordRegex(word, 'i'), BLANK_PLACEHOLDER);
}

function buildSentencesEntries(rawEntries: EntryDto[]): SentencesEntry[] {
  return rawEntries
    .map((entry) => {
      const sentences = entry.exampleSentences ?? [];
      const word = entry.word ?? '';
      const eligibleIndices = sentences
        .map((sentence, index) => ({ sentence, index }))
        .filter(({ sentence }) => sentenceContainsWord(sentence, word))
        .map(({ index }) => index);

      const selectedSentenceIndices = eligibleIndices.slice(0, MAX_SENTENCES_PER_ENTRY);
      const sentenceCounters: Record<number, number> = {};
      for (const index of selectedSentenceIndices) {
        sentenceCounters[index] = 0;
      }

      return {
        ...entry,
        selectedSentenceIndices,
        sentenceCounters,
      } satisfies SentencesEntry;
    })
    .filter((entry) => entry.selectedSentenceIndices.length > 0);
}

export function SetSentencesMode({ set }: SetSentencesModeProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const [entries, setEntries] = useState<SentencesEntry[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const registerAnswer = useRegisterAnswer();

  const { playAudio } = usePronunciation(currentQuestion?.entry.word || '', currentQuestion?.entry.wordType, {
    autoPlay: false,
    enabled: !!currentQuestion?.entry.word,
  });

  useEffect(() => {
    if (!set?.entries || !set.setId) {
      return;
    }

    const saved = loadSession<SentencesEntry>(set.setId, 'sentences');
    if (saved && validateSession(saved, set.entries)) {
      setEntries(saved);
      setHasInitialized(true);
      generateNextQuestion(saved);
      return;
    }

    if (saved) {
      clearSession(set.setId, 'sentences');
    }

    const initialEntries = buildSentencesEntries(set.entries);
    setEntries(initialEntries);
    setHasInitialized(true);
    if (initialEntries.length > 0) {
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

  const collectEligibleQuestions = (currentEntries: SentencesEntry[]): Question[] => {
    const questions: Question[] = [];
    currentEntries.forEach((entry, entryIndex) => {
      for (const sentenceIndex of entry.selectedSentenceIndices) {
        const counter = entry.sentenceCounters[sentenceIndex] ?? 0;
        if (counter >= MASTERY_THRESHOLD) {
          continue;
        }

        const originalSentence = entry.exampleSentences?.[sentenceIndex];
        if (!originalSentence) {
          continue;
        }

        questions.push({
          entry,
          entryIndex,
          sentenceIndex,
          originalSentence,
          sentenceWithBlank: buildSentenceWithBlank(originalSentence, entry.word ?? ''),
        });
      }
    });

    return questions;
  };

  const generateNextQuestion = (
    currentEntries: SentencesEntry[],
    previous?: { word: string; sentenceIndex: number },
  ) => {
    let eligible = collectEligibleQuestions(currentEntries);

    if (eligible.length === 0) {
      setCurrentQuestion(null);
      setIsComplete(true);
      if (set?.setId) {
        clearSession(set.setId, 'sentences');
      }
      return;
    }

    if (eligible.length > 1 && previous) {
      const filteredSamePair = eligible.filter(
        (q) => !(q.entry.word === previous.word && q.sentenceIndex === previous.sentenceIndex),
      );
      if (filteredSamePair.length > 0) {
        eligible = filteredSamePair;
      }

      const filteredSameEntry = eligible.filter((q) => q.entry.word !== previous.word);
      if (filteredSameEntry.length > 0) {
        eligible = filteredSameEntry;
      }
    }

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    setCurrentQuestion(shuffled[0]);
  };

  const checkAnswer = () => {
    if (!currentQuestion) {
      return;
    }

    const expected = (currentQuestion.entry.word ?? '').toLowerCase();
    const correct = userAnswer.trim().toLowerCase() === expected;

    registerAnswer.mutate({
      modeType: 'sentences',
      questionType: 'sentence-fill',
      question: currentQuestion.sentenceWithBlank,
      givenAnswer: userAnswer,
      expectedAnswer: currentQuestion.entry.word ?? '',
      isCorrect: correct,
      wordId: currentQuestion.entry.wordId,
    });

    setIsCorrect(correct);
    setShowFeedback(true);

    const updatedEntries = entries.map((entry) => ({
      ...entry,
      sentenceCounters: { ...entry.sentenceCounters },
    }));
    const entry = updatedEntries[currentQuestion.entryIndex];
    const previousCounter = entry.sentenceCounters[currentQuestion.sentenceIndex] ?? 0;

    if (correct) {
      entry.sentenceCounters[currentQuestion.sentenceIndex] = Math.min(previousCounter + 1, MASTERY_THRESHOLD);
    } else {
      entry.sentenceCounters[currentQuestion.sentenceIndex] = 0;
    }

    setEntries(updatedEntries);

    if (set?.setId) {
      saveSession(set.setId, set.name ?? '', 'sentences', updatedEntries);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    if (currentQuestion) {
      generateNextQuestion(entries, {
        word: currentQuestion.entry.word ?? '',
        sentenceIndex: currentQuestion.sentenceIndex,
      });
    } else {
      generateNextQuestion(entries);
    }
  };

  const totalQuestions = entries.reduce((sum, entry) => sum + entry.selectedSentenceIndices.length, 0);

  const masteredQuestions = entries.reduce((sum, entry) => {
    return (
      sum +
      entry.selectedSentenceIndices.filter(
        (sentenceIndex) => (entry.sentenceCounters[sentenceIndex] ?? 0) >= MASTERY_THRESHOLD,
      ).length
    );
  }, 0);

  const totalProgressPoints = totalQuestions * MASTERY_THRESHOLD;
  const earnedProgressPoints = entries.reduce((sum, entry) => {
    return (
      sum +
      entry.selectedSentenceIndices.reduce(
        (entrySum, sentenceIndex) => entrySum + Math.min(entry.sentenceCounters[sentenceIndex] ?? 0, MASTERY_THRESHOLD),
        0,
      )
    );
  }, 0);

  const progress = totalProgressPoints > 0 ? (earnedProgressPoints / totalProgressPoints) * 100 : 0;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !showFeedback) {
      event.preventDefault();
      checkAnswer();
    }
  };

  if (hasInitialized && entries.length === 0) {
    return (
      <>
        <Container size="md">
          <Alert color="orange" title="No usable example sentences">
            This set doesn't contain any entries with example sentences that include the target word.
          </Alert>
        </Container>
      </>
    );
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
              You've completed the sentences mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered every sentence-question in this set.
            </Text>
            <Group wrap="wrap" justify="center">
              <Button
                variant="light"
                onClick={() => navigate(links.sets.getUrl({}, { page: returnPage }))}
                size="md"
                autoFocus>
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
        <Progress value={progress} size="lg" radius="md" />
        <Text size="sm" c="dimmed" ta="center">
          {masteredQuestions} / {totalQuestions} questions completed
        </Text>

        <Paper>
          <Stack gap="lg">
            <div>
              <Text fz={{ base: 'md', md: 'lg' }} fw={600} mb="md">
                {currentQuestion.sentenceWithBlank}
              </Text>
              <Text size="sm" c="dimmed">
                Translations: {serialize(currentQuestion.entry.translations)}
              </Text>
              <Text size="sm" c="dimmed">
                Word type: {currentQuestion.entry.wordType}
              </Text>
            </div>

            {!showFeedback ? (
              <Stack gap="md">
                <TextInput
                  placeholder="Type the missing word..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  size="lg"
                  onKeyDown={handleKeyDown}
                  autoFocus
                  spellCheck={false}
                  lang="en"
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
                        The correct answer is: <strong>{currentQuestion.entry.word}</strong>
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
                  <Text mt="sm" fz={{ base: 'sm', md: 'md' }}>
                    <strong>Sentence:</strong> {currentQuestion.originalSentence}
                  </Text>
                  {currentQuestion.entry.exampleSentences && currentQuestion.entry.exampleSentences.length > 0 && (
                    <div style={{ marginTop: 'var(--mantine-spacing-sm)' }}>
                      <ExampleSentences sentences={currentQuestion.entry.exampleSentences} />
                    </div>
                  )}
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
