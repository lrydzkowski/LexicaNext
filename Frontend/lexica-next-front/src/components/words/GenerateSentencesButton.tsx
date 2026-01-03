import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useGenerateExampleSentences } from '../../hooks/api';
import { WordFormValues } from './WordFormTypes';

interface GenerateSentencesButtonProps {
  form: UseFormReturnType<WordFormValues>;
  onSentencesGenerated: (sentences: string[]) => void;
  disabled?: boolean;
}

export function GenerateSentencesButton({ form, onSentencesGenerated, disabled }: GenerateSentencesButtonProps) {
  const generateSentencesMutation = useGenerateExampleSentences();

  const handleClick = () => {
    const word = form.getValues().word || '';
    const wordType = form.getValues().wordType || '';

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
            autoClose: false,
          });
        },
      },
    );
  };

  return (
    <Button
      variant="light"
      size="xs"
      leftSection={<IconSparkles size={14} />}
      onClick={handleClick}
      loading={generateSentencesMutation.isPending}
      disabled={disabled}
      w={180}>
      Generate Sentences
    </Button>
  );
}
