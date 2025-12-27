import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCreateWord } from '../../hooks/api';

interface WordFormValues {
  word: string;
  wordType: string;
  translations: { name: string }[];
  exampleSentences: { sentence: string }[];
}

interface WordFormProps {
  mode: 'create';
}

export function WordForm({ mode }: WordFormProps) {
  const navigate = useNavigate();
  const createWordMutation = useCreateWord();
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const translationRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sentenceRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusTranslation, setFocusTranslation] = useState<number | null>(null);
  const [focusSentence, setFocusSentence] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  const form = useForm<WordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      word: '',
      wordType: 'noun',
      translations: [{ name: '' }],
      exampleSentences: [],
    },
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
    form.insertListItem('translations', { name: '' });
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
    form.insertListItem('exampleSentences', { sentence: '' });
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

  const handleSubmit = (values: WordFormValues) => {
    createWordMutation.mutate(
      {
        word: values.word.trim(),
        wordType: values.wordType,
        translations: values.translations.map((t) => t.name.trim()),
        exampleSentences: values.exampleSentences.map((s) => s.sentence.trim()),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Word created successfully',
            color: 'green',
            position: 'top-center',
          });
          navigate('/words');
        },
        onError: () => {
          notifications.show({
            title: 'Error Creating Word',
            message: 'Failed to create word',
            color: 'red',
            position: 'top-center',
          });
        },
      },
    );
  };

  return (
    <>
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
            {form.getValues().translations.map((_, index) => (
              <Group key={index} mb="xs" wrap="nowrap" align="top">
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
            <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addTranslation}>
              Add Translation
            </Button>
          </div>

          <Divider label="Example Sentences (Optional)" labelPosition="center" />

          <div>
            {form.getValues().exampleSentences.map((_, index) => (
              <Group key={index} mb="xs" wrap="nowrap" align="top">
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
            <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addSentence}>
              Add Sentence
            </Button>
          </div>

          <Group justify="space-between" mt="xl" wrap="wrap">
            <Button variant="light" onClick={() => navigate(`/words?page=${returnPage}`)} size="md">
              Cancel
            </Button>
            <Button type="submit" loading={createWordMutation.isPending} size="md">
              Create Word
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
