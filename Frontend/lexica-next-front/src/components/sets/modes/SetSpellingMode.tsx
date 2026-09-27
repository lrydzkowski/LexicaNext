import { IconCheck, IconVolume, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Anchor,
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
import { useDisclosure } from '@mantine/hooks';
import { links } from '@/config/links';
import { useSpellingMode } from '@/hooks/learning/useSpellingMode';
import { useReturnTo } from '@/hooks/useReturnTo';
import { serialize } from '@/utils/utils';
import type { GetSetResponse } from '../../../hooks/api';
import { ExampleSentences } from '../ExampleSentences';
import { ModeWordsListModal } from './ModeWordsListModal';

export interface SetSpellingModeProps {
  set: GetSetResponse;
}

export function SetSpellingMode({ set }: SetSpellingModeProps) {
  const goBack = useReturnTo(links.sets.getUrl());
  const {
    entries,
    currentEntry,
    userInput,
    setUserInput,
    showFeedback,
    isCorrect,
    isComplete,
    playAudio,
    pronunciationLoading,
    checkAnswer,
    nextQuestion,
    progress,
    completedCount,
  } = useSpellingMode(set);
  const [wordsModalOpened, { open: openWordsModal, close: closeWordsModal }] = useDisclosure(false);

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
              You've completed the spelling mode for "{set?.name}"!
            </Text>
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }}>
              You've successfully learned the spelling of all words in this set.
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
            <Stack ta="center">
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
            </Stack>

            {!showFeedback ? (
              <Stack gap="md">
                <TextInput
                  placeholder="Type the word you heard..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
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
                        Your answer is: <strong>{userInput}</strong>
                      </Text>
                      <Text>
                        The correct spelling is: <strong>{currentEntry.word}</strong>
                      </Text>
                    </>
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
                    <strong>Translations:</strong> {serialize(currentEntry.translations)}
                  </Text>
                  {currentEntry.exampleSentences && currentEntry.exampleSentences.length > 0 && (
                    <div style={{ marginTop: 'var(--mantine-spacing-sm)' }}>
                      <ExampleSentences sentences={currentEntry.exampleSentences} />
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
