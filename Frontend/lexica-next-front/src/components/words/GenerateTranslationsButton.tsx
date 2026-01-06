import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { showErrorNotification, showErrorTextNotification } from '@/services/error-notifications';
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
      showErrorTextNotification('Error', 'Please enter a word first');
      return;
    }

    if (!wordType || wordType === 'none') {
      showErrorTextNotification('Error', 'Please select a word type first');
      return;
    }

    generateTranslationsMutation.mutate(
      { word: word.trim(), wordType, count: 3 },
      {
        onSuccess: (response) => {
          onTranslationsGenerated(response.translations);
        },
        onError: (error) => {
          showErrorNotification('Error', error);
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
