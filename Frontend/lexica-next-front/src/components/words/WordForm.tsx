import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { ActionIcon, Box, Button, Divider, Group, LoadingOverlay, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { links } from '@/config/links';
import { useCreateWord, useUpdateWord, type GetWordResponse } from '../../hooks/api';
import { GenerateSentencesButton } from './GenerateSentencesButton';
import { GenerateTranslationsButton } from './GenerateTranslationsButton';
import { WordFormSuccessData, WordFormValues } from './WordFormTypes';

interface WordFormProps {
  mode: 'create' | 'edit';
  wordId?: string;
  word?: GetWordResponse;
  isLoading?: boolean;
  onSuccess?: (data: WordFormSuccessData) => void;
  onCancel?: () => void;
}

export function WordForm({ mode, wordId, word, isLoading, onSuccess, onCancel }: WordFormProps) {
  const navigate = useNavigate();
  const createWordMutation = useCreateWord();
  const updateWordMutation = useUpdateWord();
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const translationRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sentenceRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusTranslation, setFocusTranslation] = useState<number | null>(null);
  const [focusSentence, setFocusSentence] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  const getInitialValues = (): WordFormValues => {
    return {
      word: '',
      wordType: 'noun',
      translations: [{ name: '', key: randomId() }],
      exampleSentences: [],
    };
  };

  const form = useForm<WordFormValues>({
    mode: 'uncontrolled',
    initialValues: getInitialValues(),
    validate: {
      word: (value) => {
        if (!value?.trim()) {
          return 'Word is required';
        }
        if (value.trim().length > 200) {
          return 'Word must be less than 200 characters';
        }
        return null;
      },
      translations: {
        name: (value) => {
          if (!value?.trim()) {
            return 'Translation is required';
          }
          if (value.trim().length > 200) {
            return 'Translation must be less than 200 characters';
          }
          return null;
        },
      },
      exampleSentences: {
        sentence: (value) => {
          if (!value?.trim()) {
            return 'Sentence is required';
          }
          if (value.trim().length > 500) {
            return 'Sentence must be less than 500 characters';
          }
          return null;
        },
      },
    },
  });

  useEffect(() => {
    if (mode === 'edit' && word) {
      form.setValues({
        word: word.word || '',
        wordType: word.wordType?.toLowerCase() || 'noun',
        translations: word.translations?.length
          ? word.translations.map((t) => ({ name: t, key: randomId() }))
          : [{ name: '', key: randomId() }],
        exampleSentences: word.exampleSentences?.length
          ? word.exampleSentences.map((s) => ({ sentence: s, key: randomId() }))
          : [],
      });
      setTimeout(() => {
        wordInputRef.current?.focus();
      }, 0);
    }
  }, [word, mode]);

  useEffect(() => {
    if (mode === 'create' && wordInputRef.current) {
      wordInputRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (focusTranslation !== null && translationRefs.current[focusTranslation]) {
      translationRefs.current[focusTranslation]?.focus();
      setFocusTranslation(null);
    }
  }, [focusTranslation]);

  useEffect(() => {
    if (focusSentence !== null && sentenceRefs.current[focusSentence]) {
      sentenceRefs.current[focusSentence]?.focus();
      setFocusSentence(null);
    }
  }, [focusSentence]);

  const addTranslation = () => {
    form.insertListItem('translations', { name: '', key: randomId() });
    setTimeout(() => {
      const newIndex = form.getValues().translations.length;
      setFocusTranslation(newIndex - 1);
    }, 0);
  };

  const removeTranslation = (index: number) => {
    form.removeListItem('translations', index);
    setTimeout(() => {
      const remaining = form.getValues().translations.length;
      if (remaining > 0) {
        setFocusTranslation(Math.max(0, index - 1));
      }
    }, 0);
  };

  const addSentence = () => {
    form.insertListItem('exampleSentences', { sentence: '', key: randomId() });
    setTimeout(() => {
      const newIndex = form.getValues().exampleSentences.length;
      setFocusSentence(newIndex - 1);
    }, 0);
  };

  const removeSentence = (index: number) => {
    form.removeListItem('exampleSentences', index);
    setTimeout(() => {
      const remaining = form.getValues().exampleSentences.length;
      if (remaining > 0) {
        setFocusSentence(Math.max(0, index - 1));
      }
    }, 0);
  };

  const handleTranslationsGenerated = (newTranslations: string[]) => {
    const currentTranslations = form.getValues().translations || [];
    currentTranslations.forEach((_, index) => {
      form.clearFieldError(`translations.${index}.name`);
    });
    const itemsToAdd = newTranslations.length - currentTranslations.length;
    for (let i = 0; i < itemsToAdd; i++) {
      form.insertListItem('translations', { name: '', key: randomId() });
    }
    for (let index = 0; index < newTranslations.length; index++) {
      form.setFieldValue(`translations.${index}.name`, newTranslations[index]);
    }
  };

  const handleSentencesGenerated = (newSentences: string[]) => {
    const currentSentences = form.getValues().exampleSentences || [];
    currentSentences.forEach((_, index) => {
      form.clearFieldError(`exampleSentences.${index}.sentence`);
    });
    const itemsToAdd = newSentences.length - currentSentences.length;
    for (let i = 0; i < itemsToAdd; i++) {
      form.insertListItem(`exampleSentences`, { sentence: '', key: randomId() });
    }
    for (let index = 0; index < newSentences.length; index++) {
      form.setFieldValue(`exampleSentences.${index}.sentence`, newSentences[index]);
    }
  };

  const handleSubmit = (values: WordFormValues) => {
    const payload = {
      word: values.word.trim(),
      wordType: values.wordType,
      translations: values.translations.map((t) => t.name.trim()),
      exampleSentences: values.exampleSentences.map((s) => s.sentence.trim()),
    };

    if (mode === 'create') {
      createWordMutation.mutate(payload, {
        onSuccess: (data) => {
          if (onSuccess && data.wordId) {
            onSuccess({
              wordId: data.wordId,
              word: payload.word,
              wordType: payload.wordType,
            });
          } else {
            navigate(links.words.getUrl());
          }
        },
        onError: () => {
          notifications.show({
            title: 'Error Creating Word',
            message: 'Failed to create word',
            color: 'red',
            position: 'top-center',
            autoClose: false,
          });
        },
      });
    } else if (mode === 'edit' && wordId) {
      updateWordMutation.mutate(
        { wordId, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess({
                wordId,
                word: payload.word,
                wordType: payload.wordType,
              });
            } else {
              navigate(links.words.getUrl({}, { returnPage }));
            }
          },
          onError: () => {
            notifications.show({
              title: 'Error Updating Word',
              message: 'Failed to update word',
              color: 'red',
              position: 'top-center',
              autoClose: false,
            });
          },
        },
      );
    }
  };

  const isPending = createWordMutation.isPending || updateWordMutation.isPending;

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Group wrap="wrap" align="top">
            <TextInput
              ref={wordInputRef}
              label="English Word"
              placeholder="Enter English word..."
              style={{ flex: 1, minWidth: '200px' }}
              size="md"
              {...form.getInputProps('word')}
              lang="en"
              spellCheck
              key={form.key('word')}
            />
            <Select
              label="Word Type"
              data={[
                { value: 'none', label: 'None' },
                { value: 'noun', label: 'Noun' },
                { value: 'verb', label: 'Verb' },
                { value: 'adjective', label: 'Adjective' },
                { value: 'adverb', label: 'Adverb' },
                { value: 'other', label: 'Other' },
              ]}
              size="md"
              w={{ base: '100%', md: 200 }}
              {...form.getInputProps('wordType')}
              key={form.key('wordType')}
            />
          </Group>

          <Divider label="Translations" labelPosition="center" />

          <div>
            {form.getValues().translations.map((item, index) => (
              <Group key={item.key} mb="xs" wrap="nowrap" align="top">
                <TextInput
                  ref={(el) => {
                    translationRefs.current[index] = el;
                  }}
                  placeholder="Enter translation..."
                  style={{ flex: 1 }}
                  size="md"
                  {...form.getInputProps(`translations.${index}.name`)}
                  lang="pl"
                  spellCheck
                  key={form.key(`translations.${index}.name`)}
                />
                {form.getValues().translations.length > 1 && (
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeTranslation(index)}
                    aria-label={`Remove translation ${index + 1}`}
                    mt="7px">
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            <Group gap="xs">
              <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addTranslation} w={180}>
                Add Translation
              </Button>
              <GenerateTranslationsButton form={form} onTranslationsGenerated={handleTranslationsGenerated} />
            </Group>
          </div>

          <Divider label="Example Sentences (Optional)" labelPosition="center" />

          <div>
            {form.getValues().exampleSentences.map((item, index) => (
              <Group key={item.key} mb="xs" wrap="nowrap" align="top">
                <TextInput
                  ref={(el) => {
                    sentenceRefs.current[index] = el;
                  }}
                  placeholder="Enter example sentence..."
                  style={{ flex: 1 }}
                  size="md"
                  {...form.getInputProps(`exampleSentences.${index}.sentence`)}
                  lang="en"
                  spellCheck
                  key={form.key(`exampleSentences.${index}.sentence`)}
                />
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeSentence(index)}
                  aria-label={`Remove sentence ${index + 1}`}
                  mt="7px">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Group gap="xs">
              <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addSentence} w={180}>
                Add Sentence
              </Button>
              <GenerateSentencesButton form={form} onSentencesGenerated={handleSentencesGenerated} />
            </Group>
          </div>

          <Group justify="space-between" mt="xl" wrap="wrap">
            <Button
              variant="light"
              onClick={() => (onCancel ? onCancel() : navigate(links.words.getUrl({}, { returnPage })))}
              size="md"
              w={120}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} size="md" w={120}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
