import { Stack, Text } from '@mantine/core';

interface ExampleSentencesProps {
  sentences: string[];
}

export function ExampleSentences({ sentences }: ExampleSentencesProps) {
  if (sentences.length === 0) {
    return null;
  }

  return (
    <div>
      <Text size="sm" c="dimmed" fw={500} mb="xs">
        Example Sentences:
      </Text>
      <Stack gap="xs">
        {sentences.map((sentence, index) => (
          <Text key={index} size="sm" fs="italic">
            "{sentence}"
          </Text>
        ))}
      </Stack>
    </div>
  );
}
