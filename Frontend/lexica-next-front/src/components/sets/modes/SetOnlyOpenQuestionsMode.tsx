import { IconCheck, IconX } from '@tabler/icons-react';
import { Alert, Anchor, Button, Container, Group, Paper, Progress, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { links } from '@/config/links';
import { useOpenQuestionsMode } from '@/hooks/learning/useOpenQuestionsMode';
import { useReturnTo } from '@/hooks/useReturnTo';
import { serialize } from '@/utils/utils';
import type { EntryDto } from '../../../hooks/api';
import { ExampleSentences } from '../ExampleSentences';
import { ModeWordsListModal } from './ModeWordsListModal';

export interface SetOnlyOpenQuestionsModeProps {
  entries: EntryDto[];
  sessionSetId: string;
  title: string;
  onBack?: () => void;
}

export function SetOnlyOpenQuestionsMode({
  entries: sourceEntries,
  sessionSetId,
  title,
  onBack,
}: SetOnlyOpenQuestionsModeProps) {
  const returnTo = useReturnTo(links.sets.getUrl());
  const goBack = onBack ?? returnTo;
  const {
    entries,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    showFeedback,
    isCorrect,
    isComplete,
    checkAnswer,
    nextQuestion,
    progress,
    completedCount,
  } = useOpenQuestionsMode(sourceEntries, sessionSetId, title);
  const [wordsModalOpened, { open: openWordsModal, close: closeWordsModal }] = useDisclosure(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !showFeedback) {
      event.preventDefault();
      checkAnswer();
    }
  };

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

  if (isComplete) {
    return (
      <>
        <Container size="md">
          <Stack gap="lg" align="center" py="xl">
            <Title order={1} ta="center" c="green" fz={{ base: 'h2', md: 'h1' }}>
              🎉 Congratulations!
            </Title>
            <Text fz={{ base: 'md', md: 'lg' }} ta="center">
              You've completed the open questions mode for "{title}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've mastered all the words through advanced open question practice.
            </Text>
            <Group wrap="wrap" justify="center">
              <Button variant="light" onClick={goBack} size="md" autoFocus>
                Back
              </Button>
              <Button onClick={() => window.location.reload()} size="md">
                Practice Again
              </Button>
              <Button variant="subtle" onClick={openWordsModal} size="md">
                Show Words
              </Button>
            </Group>
          </Stack>
        </Container>
        <ModeWordsListModal opened={wordsModalOpened} onClose={closeWordsModal} entries={entries} />
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
        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
          <Text size="sm" c="dimmed">
            {completedCount} / {entries.length} words completed
          </Text>
          <Anchor component="button" type="button" size="sm" onClick={openWordsModal}>
            Show Words
          </Anchor>
        </Group>

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
                  spellCheck={false}
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
      <ModeWordsListModal opened={wordsModalOpened} onClose={closeWordsModal} entries={entries} />
    </>
  );
}
