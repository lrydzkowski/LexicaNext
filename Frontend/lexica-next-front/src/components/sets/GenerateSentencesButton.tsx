import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useGenerateExampleSentences } from '../../hooks/api';

interface GenerateSentencesButtonProps {
  word: string;
  wordType: string;
  onSentencesGenerated: (sentences: string[]) => void;
  disabled?: boolean;
}

export function GenerateSentencesButton({
  word,
  wordType,
  onSentencesGenerated,
  disabled,
}: GenerateSentencesButtonProps) {
  const generateSentencesMutation = useGenerateExampleSentences();

  const handleClick = () => {
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
          notifications.show({
            title: 'Success',
            message: `Generated ${response.sentences.length} example sentences`,
            color: 'green',
            position: 'top-center',
          });
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
