import { Button, Group, List, Modal, Stack, Text } from '@mantine/core';

interface SetToDelete {
  setId: string;
  setName: string;
}

interface DeleteSetModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  sets: SetToDelete[];
}

export function DeleteSetModal({ opened, onClose, onConfirm, isDeleting, sets }: DeleteSetModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Sets">
      <Stack gap="md">
        <Text>Are you sure you want to delete the following sets? This action cannot be undone.</Text>
        <List size="sm" spacing="xs" styles={{ itemWrapper: { width: '100%' }, itemLabel: { width: '100%' } }}>
          {sets.map((set) => (
            <List.Item key={set.setId}>
              <Text size="sm" truncate>
                {set.setName}
              </Text>
            </List.Item>
          ))}
        </List>
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
