import { Badge, Container, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { serialize } from '@/utils/utils';
import type { EntryDto } from '../../../hooks/api';

interface ModeWordsListModalProps {
  opened: boolean;
  onClose: () => void;
  entries: EntryDto[];
}

export function ModeWordsListModal({ opened, onClose, entries }: ModeWordsListModalProps) {
  return (
    <Modal.Root opened={opened} onClose={onClose} size="lg" fullScreen returnFocus>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Container size="md" p={0} w="100%">
            <Group justify="space-between">
              <Title size={16} fw={500}>
                Words in this mode
              </Title>
              <Modal.CloseButton aria-label="Close" />
            </Group>
          </Container>
        </Modal.Header>
        <Modal.Body>
          <Container size="md" p={5}>
            {entries.length === 0 ? (
              <Text c="dimmed" ta="center">
                No words in this session.
              </Text>
            ) : (
              <Stack gap="sm">
                {entries.map((entry, index) => (
                  <Paper key={entry.wordId ?? `${entry.word}-${index}`} p="md" withBorder>
                    <Stack gap="xs">
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Text fw={600} fz={{ base: 'md', md: 'lg' }} style={{ flex: 1, minWidth: 0 }}>
                          {entry.word}
                        </Text>
                        {entry.wordType ? (
                          <Badge size="sm" variant="light">
                            {entry.wordType}
                          </Badge>
                        ) : null}
                      </Group>
                      <Text size="sm">
                        <strong>Translations:</strong> {serialize(entry.translations)}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Container>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
