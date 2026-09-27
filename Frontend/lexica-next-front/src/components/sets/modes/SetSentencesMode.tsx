import { IconCheck, IconX } from '@tabler/icons-react';
import { Alert, Anchor, Button, Container, Group, Paper, Progress, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { links } from '@/config/links';
import { useSentencesMode } from '@/hooks/learning/useSentencesMode';
import { useReturnTo } from '@/hooks/useReturnTo';
import { serialize } from '@/utils/utils';
import type { GetSetResponse } from '../../../hooks/api';
import { ExampleSentences } from '../ExampleSentences';
import { ModeWordsListModal } from './ModeWordsListModal';

export interface SetSentencesModeProps {
  set: GetSetResponse;
}

export function SetSentencesMode({ set }: SetSentencesModeProps) {
  const goBack = useReturnTo(links.sets.getUrl());
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
    hasInitialized,
    totalQuestions,
    masteredQuestions,
  } = useSentencesMode(set);
  const [wordsModalOpened, { open: openWordsModal, close: closeWordsModal }] = useDisclosure(false);

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
              <Button variant="light" onClick={goBack} size="md" autoFocus>
                Back to Sets
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
            {masteredQuestions} / {totalQuestions} questions completed
          </Text>
          <Anchor component="button" type="button" size="sm" onClick={openWordsModal}>
            Show Words
          </Anchor>
        </Group>

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
      <ModeWordsListModal opened={wordsModalOpened} onClose={closeWordsModal} entries={entries} />
    </>
  );
}
