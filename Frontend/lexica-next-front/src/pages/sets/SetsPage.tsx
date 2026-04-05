import { Container, Group, Stack, Title } from '@mantine/core';
import { SetsList } from '../../components/sets/SetsList';

export function SetsPage() {
  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Title order={2} size="h3">
              My Vocabulary Sets
            </Title>
          </Group>
          <SetsList />
        </Stack>
      </Container>
    </>
  );
}
