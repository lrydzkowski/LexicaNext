import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { SetEditForm } from '../../components/sets/SetEditForm';

export function SetEditPage() {
  const navigate = useNavigate();

  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} mb="sm" mt="sm">
              Edit Set
            </Title>
          </Group>
          <SetEditForm />
        </Stack>
      </Container>
    </>
  );
}
