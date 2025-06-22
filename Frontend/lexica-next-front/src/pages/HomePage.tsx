import { IconBooks, IconBrain, IconHeadphones, IconTarget } from '@tabler/icons-react';
import { Container, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';

export function HomePage() {
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
                    Comprehensive learning with both close and open questions to master word meanings.
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
                1.
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Create Sets:
                </Text>
                Build custom vocabulary sets with English words and their translations.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                2.
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Choose Mode:
                </Text>
                Select from our four learning modes based on your current level and goals.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                3.
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Practice:
                </Text>
                Engage with interactive exercises that adapt to your progress.
              </Text>
              <Text c="dimmed" fz={{ base: 'md', md: 'lg' }}>
                4.
                <Text span c="black" fw={600} fz={{ base: 'md', md: 'lg' }}>
                  Master:
                </Text>
                Repeat and reinforce until you've mastered each word.
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
