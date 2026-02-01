import { Button, Group, List, Modal, Stack, Text } from '@mantine/core';

interface WordToDelete {
  wordId: string;
  wordName: string;
}

interface DeleteWordModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  words: WordToDelete[];
}

export function DeleteWordModal({ opened, onClose, onConfirm, isDeleting, words }: DeleteWordModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Words"
      closeOnClickOutside={!isDeleting}
      closeOnEscape={!isDeleting}>
      <Stack gap="md">
        <>
          <Text>Are you sure you want to delete the following words? This action cannot be undone.</Text>
          <List size="sm" spacing="xs" styles={{ itemWrapper: { width: '100%' }, itemLabel: { width: '100%' } }}>
            {words.map((word) => (
              <List.Item key={word.wordId}>
                <Text size="sm" truncate>
                  {word.wordName}
                </Text>
              </List.Item>
            ))}
          </List>
        </>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isDeleting} data-autofocus>
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
