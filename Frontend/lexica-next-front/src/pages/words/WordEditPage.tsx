import { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { links } from '@/config/links';
import { showErrorNotification } from '@/services/error-notifications';
import { WordForm } from '../../components/words/WordForm';
import { useWord } from '../../hooks/api';

export function WordEditPage() {
  const navigate = useNavigate();
  const { wordId } = useParams<{ wordId: string }>();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

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
          <ActionIcon
            variant="subtle"
            onClick={() => navigate(links.words.getUrl({}, { page: returnPage }))}
            aria-label="Go back to words">
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={2} mb="sm" mt="sm">
            Edit Word
          </Title>
        </Group>
        <WordForm mode="edit" wordId={wordId} word={word} isLoading={isLoading} />
      </Stack>
    </Container>
  );
}
