import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { SetNewForm } from '../../components/sets/SetNewForm';

export function SetNewPage() {
  const navigate = useNavigate();

  return (
    <>
      <Container p={0}>
        <Stack gap="sm">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} mb="sm" mt="sm">
              Create New Set
            </Title>
          </Group>
          <SetNewForm />
        </Stack>
      </Container>
    </>
  );
}
