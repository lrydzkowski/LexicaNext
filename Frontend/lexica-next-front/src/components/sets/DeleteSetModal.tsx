import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface DeleteSetModalProps {
  opened: boolean;
  onClose: () => void;
  setName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteSetModal({ opened, onClose, setName, onConfirm, isDeleting }: DeleteSetModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Set">
      <Stack gap="md">
        <Text style={{ wordBreak: 'break-word' }}>
          Are you sure you want to delete "<strong>{setName}</strong>"? This action cannot be undone.
        </Text>

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
