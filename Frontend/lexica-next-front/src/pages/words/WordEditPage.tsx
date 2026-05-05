import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { links } from '@/config/links';
import { useReturnTo } from '@/hooks/useReturnTo';
import { showErrorNotification } from '@/services/error-notifications';
import { WordForm } from '../../components/words/WordForm';
import { useWord } from '../../hooks/api';

export function WordEditPage() {
  const navigate = useNavigate();
  const { wordId } = useParams<{ wordId: string }>();
  const goBack = useReturnTo(links.words.getUrl());

  const { data: word, isLoading, error } = useWord(wordId!);

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Word', error);
      navigate(links.words.getUrl());
    }
  }, [error, navigate]);

  return (
    <Container p={0}>
      <Stack gap="sm">
        <Group>
          <ActionIcon variant="subtle" onClick={goBack} aria-label="Go back">
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={2} size="h3">
            Edit Word
          </Title>
        </Group>
        <WordForm mode="edit" wordId={wordId} word={word} isLoading={isLoading} />
      </Stack>
    </Container>
  );
}
