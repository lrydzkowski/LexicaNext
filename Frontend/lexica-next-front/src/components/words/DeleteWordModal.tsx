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
  const { data: wordSetsData, isLoading } = useWordSets(wordId, opened);
  const affectedSets = wordSetsData?.sets || [];

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Word" centered>
      <Stack gap="md">
        <Text>
          Are you sure you want to delete "<strong>{wordText}</strong>"? This action cannot be undone.
        </Text>

        {isLoading ? (
          <Text c="dimmed" size="sm">
            Loading affected sets...
          </Text>
        ) : affectedSets.length > 0 ? (
          <Box>
            <Text fw={500} mb="xs" c="orange">
              This word is used in {affectedSets.length} set{affectedSets.length > 1 ? 's' : ''}:
            </Text>
            <List size="sm" spacing="xs">
              {affectedSets.map((set) => (
                <List.Item key={set.setId}>{set.name}</List.Item>
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
