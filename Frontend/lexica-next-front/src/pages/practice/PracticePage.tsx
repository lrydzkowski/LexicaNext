import { IconDice5, IconTrendingDown } from '@tabler/icons-react';
import { Link } from 'react-router';
import { Button, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { links } from '@/config/links';

const practiceModes = [
  {
    title: '20 random words',
    description: 'Practice up to 20 words chosen at random from all your words, including words outside sets.',
    to: links.randomOpenQuestionsPractice.getUrl(),
    icon: IconDice5,
  },
  {
    title: '20 weakest words',
    description: 'Practice up to 20 words with the highest incorrect-answer rates in your Open Questions history.',
    to: links.weakestOpenQuestionsPractice.getUrl(),
    icon: IconTrendingDown,
  },
];

export function PracticePage() {
  return (
    <Container p={0}>
      <Stack gap="lg">
        <div>
          <Title order={2} size="h3">
            Practice
          </Title>
          <Text c="dimmed" mt="xs">
            Choose how to practice your vocabulary. Both options use Open Questions Mode.
          </Text>
        </div>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {practiceModes.map(({ title, description, to, icon: Icon }) => (
            <Paper key={to} component="article" aria-label={title} withBorder p="lg" radius="md">
              <Stack gap="md" h="100%">
                <Group wrap="nowrap">
                  <Icon size={24} aria-hidden="true" />
                  <Title order={3} size="h4">
                    {title}
                  </Title>
                </Group>
                <Text c="dimmed" style={{ flex: 1 }}>
                  {description}
                </Text>
                <Button component={Link} to={to} aria-label={`Start ${title}`}>
                  Start
                </Button>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
