import { useRef } from 'react';
import { Container, Group, Modal, Title } from '@mantine/core';
import { useWord } from '../../hooks/api';
import { WordForm, WordFormRef } from '../words/WordForm';
import { WordFormSuccessData } from '../words/WordFormTypes';

interface EditWordModalProps {
  opened: boolean;
  onClose: () => void;
  wordId: string | null;
  onSuccess: (data: WordFormSuccessData) => void;
}

export function EditWordModal({ opened, onClose, wordId, onSuccess }: EditWordModalProps) {
  const formRef = useRef<WordFormRef>(null);
  const { data: word, isLoading } = useWord(wordId ?? '');

  const handleModalEntered = () => {
    formRef.current?.focus();
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      size="lg"
      fullScreen
      returnFocus
      transitionProps={{ onEntered: handleModalEntered }}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Container size="md" p={0} w="100%">
            <Group justify="space-between">
              <Title size={16} fw={500}>
                Edit Word
              </Title>
              <Modal.CloseButton />
            </Group>
          </Container>
        </Modal.Header>
        <Modal.Body>
          <Container size="md" p={5}>
            {wordId && (
              <WordForm
                ref={formRef}
                mode="edit"
                wordId={wordId}
                word={word}
                isLoading={isLoading}
                onSuccess={(data) => {
                  onSuccess(data);
                  onClose();
                }}
                onCancel={onClose}
              />
            )}
          </Container>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
