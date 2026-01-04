import { Anchor, Group, Text } from '@mantine/core';

interface DictionaryLinksProps {
  word: string;
}

export function DictionaryLinks({ word }: DictionaryLinksProps) {
  const trimmedWord = word?.trim();

  if (!trimmedWord) {
    return null;
  }

  const encodedWord = encodeURIComponent(trimmedWord);

  return (
    <Group gap="md">
      <Text size="sm" c="dimmed">
        Look up:
      </Text>
      <Anchor
        href={`https://dictionary.cambridge.org/dictionary/english/${encodedWord}`}
        target="_blank"
        size="sm">
        Cambridge Dictionary
      </Anchor>
      <Anchor href={`https://ling.pl/slownik/angielsko-polski/${encodedWord}`} target="_blank" size="sm">
        Ling.pl
      </Anchor>
    </Group>
  );
}
