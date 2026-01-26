import { useRef } from 'react';
import { Container, Group, Modal, Title } from '@mantine/core';
import { WordForm, WordFormRef } from '../words/WordForm';
import { WordFormSuccessData } from '../words/WordFormTypes';

interface CreateWordModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (data: WordFormSuccessData) => void;
}

export function CreateWordModal({ opened, onClose, onSuccess }: CreateWordModalProps) {
  const formRef = useRef<WordFormRef>(null);

  const handleModalEntered = () => {
    formRef.current?.focus();
  };

  return (
    <Modal.Root opened={opened} onClose={onClose} size="lg" fullScreen transitionProps={{ onEntered: handleModalEntered }}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Container size="md" p={0} w="100%">
            <Group justify="space-between">
              <Title size={16} fw={500}>
                Create New Word
              </Title>
              <Modal.CloseButton />
            </Group>
          </Container>
        </Modal.Header>
        <Modal.Body>
          <Container size="md" p={5}>
            <WordForm
              ref={formRef}
              mode="create"
              onSuccess={(data) => {
                onSuccess(data);
                onClose();
              }}
              onCancel={onClose}
            />
          </Container>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
