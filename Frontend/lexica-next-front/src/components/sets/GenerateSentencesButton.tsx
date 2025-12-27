import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useGenerateExampleSentences } from '../../hooks/api';
import { FormValues } from './SetFormTypes';

interface GenerateSentencesButtonProps {
  form: UseFormReturnType<FormValues>;
  entryIndex: number;
  onSentencesGenerated: (sentences: string[]) => void;
  disabled?: boolean;
}

export function GenerateSentencesButton({
  form,
  entryIndex,
  onSentencesGenerated,
  disabled,
}: GenerateSentencesButtonProps) {
  const generateSentencesMutation = useGenerateExampleSentences();

  const handleClick = () => {
    const entry = form.getValues().entries[entryIndex];
    const word = entry?.word || '';
    const wordType = entry?.wordType || '';

    if (!word.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a word first',
        color: 'red',
        position: 'top-center',
      });
      return;
    }

    if (!wordType || wordType === 'none') {
      notifications.show({
        title: 'Error',
        message: 'Please select a word type first',
        color: 'red',
        position: 'top-center',
      });
      return;
    }

    generateSentencesMutation.mutate(
      { word: word.trim(), wordType, count: 3 },
      {
        onSuccess: (response) => {
          onSentencesGenerated(response.sentences);
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to generate example sentences. Please try again.',
            color: 'red',
            position: 'top-center',
          });
        },
      },
    );
  };

  return (
    <Button
      w={180}
      variant="light"
      size="xs"
      leftSection={<IconSparkles size={14} />}
      onClick={handleClick}
      loading={generateSentencesMutation.isPending}
      disabled={disabled}>
      Generate Sentences
    </Button>
  );
}
