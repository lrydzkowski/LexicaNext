import { Stack, Title } from '@mantine/core';
import { WordsStatisticsList } from '../../components/wordsStatistics/WordsStatisticsList';

export function WordsStatisticsPage() {
  return (
    <Stack gap="md">
      <Title order={2}>Words Statistics</Title>
      <WordsStatisticsList />
    </Stack>
  );
}
