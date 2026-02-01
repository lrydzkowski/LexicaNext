import { IconBooks, IconBrain, IconHeadphones, IconKeyboard, IconTarget } from '@tabler/icons-react';
import { Box, Container, Group, Kbd, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  formatShortcutKey,
  getShortcutsByScope,
  type ShortcutDefinition,
  type ShortcutScope,
} from '../config/shortcuts';

const SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: 'Global',
  'sets-list': 'Sets List',
  'words-list': 'Words List',
  'word-form': 'Word Form',
  'set-form': 'Set Form',
  'select-words': 'Select Words',
};

function ShortcutItem({ shortcut }: { shortcut: ShortcutDefinition }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text fz="sm">{shortcut.description}</Text>
      <Kbd size="sm">{formatShortcutKey(shortcut.key)}</Kbd>
    </Group>
  );
}

function ShortcutSection({ scope }: { scope: ShortcutScope }) {
  const shortcuts = getShortcutsByScope(scope);
  if (shortcuts.length === 0) {
    return null;
  }

  return (
    <Stack gap="xs">
      <Text fw={600} fz="md">
        {SCOPE_LABELS[scope]}
      </Text>
      {shortcuts.map((shortcut, index) => (
        <ShortcutItem key={`${shortcut.key}-${index}`} shortcut={shortcut} />
      ))}
    </Stack>
  );
}

export function AboutPage() {
  return (
    <>
      <Container p={{ base: 0 }}>
        <Stack gap="xl">
          <div>
            <Title order={2} mb="sm" mt="sm">
              About LexicaNext
            </Title>
            <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
              LexicaNext is a comprehensive English vocabulary learning platform designed to help you master new words
              through various interactive learning modes.
            </Text>
          </div>

          <Paper radius="md">
            <Title order={2} mb="lg" fz={{ base: 'h3', md: 'h2' }}>
              Learning Modes
            </Title>
            <Stack gap="lg">
              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size="lg" color="blue" style={{ flexShrink: 0 }}>
                  <IconHeadphones size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                    Spelling Mode
                  </Text>
                  <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                    Learn pronunciation and spelling by listening to words and typing them correctly.
                  </Text>
                </div>
              </Group>

              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size="lg" color="teal" style={{ flexShrink: 0 }}>
                  <IconBrain size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                    Full Mode
                  </Text>
                  <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                    Comprehensive learning with both closed and open questions to master word meanings.
                  </Text>
                </div>
              </Group>

              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size="lg" color="orange" style={{ flexShrink: 0 }}>
                  <IconTarget size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                    Open Questions Mode
                  </Text>
                  <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                    Advanced practice mode focusing on open-ended questions for knowledge retention.
                  </Text>
                </div>
              </Group>

              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size="lg" color="grape" style={{ flexShrink: 0 }}>
                  <IconBooks size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} fz={{ base: 'md', md: 'lg' }}>
                    Content Mode
                  </Text>
                  <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                    Review and study your vocabulary sets in a structured format.
                  </Text>
                </div>
              </Group>
            </Stack>
          </Paper>

          <Paper radius="md">
            <Title order={2} mb="lg" fz={{ base: 'h3', md: 'h2' }}>
              How It Works
            </Title>
            <Stack gap="md">
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                1.{' '}
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Create Words:
                </Text>{' '}
                Add English words along with their translations and example sentences to build your vocabulary list.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                2.{' '}
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Create Sets:
                </Text>{' '}
                Build custom vocabulary sets using words you've previously added.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                3.{' '}
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Practice:
                </Text>{' '}
                Do one round of practice in spelling mode, full mode, and open questions mode.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                4.{' '}
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Master:
                </Text>{' '}
                Repeat and reinforce in open questions mode.
              </Text>
            </Stack>
          </Paper>

          <Paper radius="md">
            <Group mb="lg">
              <ThemeIcon size="lg" color="indigo" style={{ flexShrink: 0 }}>
                <IconKeyboard size={20} />
              </ThemeIcon>
              <Title order={2} fz={{ base: 'h3', md: 'h2' }}>
                Keyboard Shortcuts
              </Title>
            </Group>
            <Box maw={450}>
              <Stack gap="lg">
                <ShortcutSection scope="global" />
                <ShortcutSection scope="sets-list" />
                <ShortcutSection scope="words-list" />
                <ShortcutSection scope="set-form" />
                <ShortcutSection scope="select-words" />
                <ShortcutSection scope="word-form" />
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
