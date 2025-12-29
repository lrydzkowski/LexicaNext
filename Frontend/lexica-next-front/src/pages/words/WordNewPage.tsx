import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { links } from '@/config/links';
import { WordForm } from '../../components/words/WordForm';

export function WordNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  return (
    <>
      <Container p={0}>
        <Stack gap="sm">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => navigate(links.words.getUrl({}, { returnPage }))}
              aria-label="Go back to words">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} mb="sm" mt="sm">
              Create New Word
            </Title>
          </Group>
          <WordForm mode="create" />
        </Stack>
      </Container>
    </>
  );
}
