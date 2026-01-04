import { Box, Button, Group, List, Modal, Stack, Text } from '@mantine/core';
import { useWordSets } from '../../hooks/api';

interface DeleteWordModalProps {
  opened: boolean;
  onClose: () => void;
  wordId: string;
  wordText: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteWordModal({ opened, onClose, wordId, wordText, onConfirm, isDeleting }: DeleteWordModalProps) {
  const { data: wordSetsData, isLoading, isError } = useWordSets(wordId, opened);
  const affectedSets = wordSetsData?.sets || [];

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Word">
      <Stack gap="md">
        <Text style={{ wordBreak: 'break-word' }}>
          Are you sure you want to delete "<strong>{wordText}</strong>"? This action cannot be undone.
        </Text>

        {isError ? (
          <Text c="red" size="sm">
            Failed to load affected sets. The word may still be deleted.
          </Text>
        ) : isLoading ? (
          <Text c="dimmed" size="sm">
            Loading affected sets...
          </Text>
        ) : affectedSets.length > 0 ? (
          <Box>
            <Text fw={500} mb="xs" c="orange">
              This word is used in {affectedSets.length} set{affectedSets.length > 1 ? 's' : ''}:
            </Text>
            <List size="sm" spacing="xs" styles={{ itemWrapper: { width: '100%' }, itemLabel: { width: '100%' } }}>
              {affectedSets.map((set) => (
                <List.Item key={set.setId}>
                  <Text size="sm" truncate>
                    {set.name}
                  </Text>
                </List.Item>
              ))}
            </List>
            <Text size="sm" c="dimmed" mt="xs">
              Deleting this word will remove it from these sets.
            </Text>
          </Box>
        ) : (
          <Text c="dimmed" size="sm">
            This word is not used in any sets.
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isDeleting}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
