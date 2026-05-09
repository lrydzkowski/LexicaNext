import { IconArrowLeft } from '@tabler/icons-react';
import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core';
import { links } from '@/config/links';
import { useReturnTo } from '@/hooks/useReturnTo';
import { SetEditForm } from '../../components/sets/SetEditForm';

export function SetEditPage() {
  const goBack = useReturnTo(links.sets.getUrl());

  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={goBack} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} size="h3">
              Edit Set
            </Title>
          </Group>
          <SetEditForm />
        </Stack>
      </Container>
    </>
  );
}
