import { IconArrowLeft } from '@tabler/icons-react';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { links } from '@/config/links';
import { useReturnTo } from '@/hooks/useReturnTo';
import { WordForm } from '../../components/words/WordForm';

export function WordNewPage() {
  const goBack = useReturnTo(links.words.getUrl());

  return (
    <>
      <Container p={0}>
        <Stack gap="sm">
          <Group>
            <ActionIcon variant="subtle" onClick={goBack} aria-label="Go back to words">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} size="h3">
              Create New Word
            </Title>
          </Group>
          <WordForm mode="create" />
        </Stack>
      </Container>
    </>
  );
}
