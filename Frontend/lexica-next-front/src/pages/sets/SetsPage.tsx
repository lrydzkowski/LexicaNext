import { Container, Group, Stack, Title } from '@mantine/core';
import { Sets } from '../../components/sets/Sets';

export function SetsPage() {
  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Title order={2} mb="sm" mt="sm">
              My Vocabulary Sets
            </Title>
          </Group>
          <Sets />
        </Stack>
      </Container>
    </>
  );
}
