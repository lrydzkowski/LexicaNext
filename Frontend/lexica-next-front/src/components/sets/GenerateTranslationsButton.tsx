import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useGenerateTranslations } from '../../hooks/api';

interface GenerateTranslationsButtonProps {
  word: string;
  wordType: string;
  onTranslationsGenerated: (translations: string[]) => void;
  disabled?: boolean;
}

export function GenerateTranslationsButton({
  word,
  wordType,
  onTranslationsGenerated,
  disabled,
}: GenerateTranslationsButtonProps) {
  const generateTranslationsMutation = useGenerateTranslations();

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

    generateTranslationsMutation.mutate(
      { word: word.trim(), wordType, count: 3 },
      {
        onSuccess: (response) => {
          onTranslationsGenerated(response.translations);
          notifications.show({
            title: 'Success',
            message: `Generated ${response.translations.length} translations`,
            color: 'green',
            position: 'top-center',
          });
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to generate translations. Please try again.',
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
      loading={generateTranslationsMutation.isPending}
      disabled={disabled}>
      Generate Translations
    </Button>
  );
}
