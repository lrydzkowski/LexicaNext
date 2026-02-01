import { forwardRef } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { showErrorNotification, showErrorTextNotification } from '@/services/error-notifications';
import { useGenerateExampleSentences } from '../../hooks/api';
import { WordFormValues } from './WordFormTypes';

interface GenerateSentencesButtonProps {
  form: UseFormReturnType<WordFormValues>;
  onSentencesGenerated: (sentences: string[]) => void;
  disabled?: boolean;
}

export const GenerateSentencesButton = forwardRef<HTMLButtonElement, GenerateSentencesButtonProps>(
  ({ form, onSentencesGenerated, disabled }, ref) => {
    const generateSentencesMutation = useGenerateExampleSentences();

    const handleClick = () => {
      const word = form.getValues().word || '';
      const wordType = form.getValues().wordType || '';

      if (!word.trim()) {
        showErrorTextNotification('Error', 'Please enter a word first');
        return;
      }

      if (!wordType || wordType === 'none') {
        showErrorTextNotification('Error', 'Please select a word type first');
        return;
      }

      generateSentencesMutation.mutate(
        { word: word.trim(), wordType, count: 3 },
        {
          onSuccess: (response) => {
            onSentencesGenerated(response.sentences);
          },
          onError: (error) => {
            showErrorNotification('Error', error);
          },
        },
      );
    };

    return (
      <Button
        ref={ref}
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
  },
);
