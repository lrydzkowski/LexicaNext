import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useGenerateTranslations } from '../../hooks/api';
import { WordFormValues } from './WordFormTypes';

interface GenerateTranslationsButtonProps {
  form: UseFormReturnType<WordFormValues>;
  onTranslationsGenerated: (translations: string[]) => void;
  disabled?: boolean;
}

export function GenerateTranslationsButton({
  form,
  onTranslationsGenerated,
  disabled,
}: GenerateTranslationsButtonProps) {
  const generateTranslationsMutation = useGenerateTranslations();

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

    generateTranslationsMutation.mutate(
      { word: word.trim(), wordType, count: 3 },
      {
        onSuccess: (response) => {
          onTranslationsGenerated(response.translations);
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to generate translations. Please try again.',
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
      loading={generateTranslationsMutation.isPending}
      disabled={disabled}
      w={180}>
      Generate Translations
    </Button>
  );
}
