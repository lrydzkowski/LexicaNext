import { Container, Group, Stack, Title } from '@mantine/core';
import { WordsList } from '../../components/words/WordsList';

export function WordsPage() {
  return (
    <Container p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap">
          <Title order={2} mb="sm" mt="sm">
            My Vocabulary Words
          </Title>
        </Group>
        <WordsList />
      </Stack>
    </Container>
  );
}
