import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCreateSet, useUpdateSet, type GetSetResponse } from '../../hooks/api';
import { GenerateSentencesButton } from './GenerateSentencesButton';
import { GenerateTranslationsButton } from './GenerateTranslationsButton';
import { FormValues } from './SetFormTypes';

interface SetFormProps {
  mode: 'create' | 'edit';
  setId?: string;
  set?: GetSetResponse;
  isLoading?: boolean;
}

export function SetForm({ mode, setId, set, isLoading }: SetFormProps) {
  const navigate = useNavigate();
  const createSetMutation = useCreateSet();
  const updateSetMutation = useUpdateSet();
  const englishWordRefs = useRef<(HTMLInputElement | null)[]>([]);
  const translationRefs = useRef<{ [entryIndex: number]: (HTMLInputElement | null)[] }>({});
  const [focusEntryIndex, setFocusEntryIndex] = useState<number | null>(null);
  const [focusTranslation, setFocusTranslation] = useState<{ entryIndex: number; translationIndex: number } | null>(
    null,
  );
  const sentenceRefs = useRef<{ [entryIndex: number]: (HTMLInputElement | null)[] }>({});
  const [focusSentence, setFocusSentence] = useState<{ entryIndex: number; sentenceIndex: number } | null>(null);
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  const getInitialValues = (): FormValues => {
    if (mode === 'create') {
      return {
        setName: uuidv4(),
        entries: [{ word: '', wordType: 'noun', translations: [{ name: '' }], exampleSentences: [] }],
      };
    }

    return {
      setName: '',
      entries: [],
    };
  };

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: getInitialValues(),
    validate: {
      setName: (value) => {
        if (!value?.trim()) {
          return 'Set name is required';
        }

        if (value.trim().length < 1) {
          return 'Set name must not be empty';
        }

        if (value.trim().length > 200) {
          return 'Set name must be less than 200 characters';
        }

        return null;
      },
      entries: {
        word: (value) => {
          if (!value?.trim()) {
            return 'Word is required';
          }

          if (value.trim().length < 1) {
            return 'Word must not be empty';
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

            if (value.trim().length < 1) {
              return 'Translation must not be empty';
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

            if (value.trim().length < 1) {
              return 'Sentence must not be empty';
            }

            if (value.trim().length > 500) {
              return 'Sentence must be less than 500 characters';
            }

            return null;
          },
        },
      },
    },
  });

  useEffect(() => {
    if (mode === 'create') {
      if (englishWordRefs.current[0]) {
        englishWordRefs.current[0].focus();
      }
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && set) {
      form.setValues({
        setName: set.name || '',
        entries:
          set.entries?.map((entry) => ({
            word: entry.word || '',
            wordType: entry.wordType || 'noun',
            translations:
              entry.translations?.map((translation) => ({
                name: translation || '',
              })) || [],
            exampleSentences:
              entry.exampleSentences?.map((sentence) => ({
                sentence: sentence || '',
              })) || [],
          })) || [],
      });
      setTimeout(() => {
        if (englishWordRefs.current[0]) {
          englishWordRefs.current[0].focus();
        }
      }, 0);
    }
  }, [set, mode]);

  useEffect(() => {
    if (focusEntryIndex !== null && englishWordRefs.current[focusEntryIndex]) {
      englishWordRefs.current[focusEntryIndex].focus();
      setFocusEntryIndex(null);
    }
  }, [focusEntryIndex]);

  useEffect(() => {
    if (focusTranslation !== null) {
      const { entryIndex, translationIndex } = focusTranslation;
      if (translationRefs.current[entryIndex]?.[translationIndex]) {
        translationRefs.current[entryIndex][translationIndex]?.focus();
        setFocusTranslation(null);
      }
    }
  }, [focusTranslation]);

  useEffect(() => {
    if (focusSentence !== null) {
      const { entryIndex, sentenceIndex } = focusSentence;
      if (sentenceRefs.current[entryIndex]?.[sentenceIndex]) {
        sentenceRefs.current[entryIndex][sentenceIndex]?.focus();
        setFocusSentence(null);
      }
    }
  }, [focusSentence]);

  const addEntry = () => {
    form.insertListItem('entries', { word: '', wordType: 'noun', translations: [{ name: '' }], exampleSentences: [] });
    setTimeout(() => {
      const newEntryIndex = form.getValues().entries.length;
      setFocusEntryIndex(newEntryIndex - 1);
    }, 0);
  };

  const removeEntry = (index: number) => {
    form.removeListItem('entries', index);
    setTimeout(() => {
      const remainingEntries = form.getValues().entries.length;
      if (remainingEntries === 0) {
        return;
      }

      setFocusEntryIndex(Math.max(0, index - 1));
    }, 0);
  };

  const addTranslation = (entryIndex: number) => {
    form.insertListItem(`entries.${entryIndex}.translations`, { name: '' });
    setTimeout(() => {
      const newTranslationIndex = form.getValues().entries[entryIndex].translations.length;
      setFocusTranslation({ entryIndex, translationIndex: newTranslationIndex - 1 });
    }, 0);
  };

  const addSentence = (entryIndex: number) => {
    form.insertListItem(`entries.${entryIndex}.exampleSentences`, { sentence: '' });
    setTimeout(() => {
      const newSentenceIndex = form.getValues().entries[entryIndex].exampleSentences.length;
      setFocusSentence({ entryIndex, sentenceIndex: newSentenceIndex - 1 });
    }, 0);
  };

  const handleTranslationsGenerated = (entryIndex: number, newTranslations: string[]) => {
    const currentTranslations = form.getValues().entries[entryIndex]?.translations || [];
    currentTranslations.forEach((_, index) => {
      form.clearFieldError(`entries.${entryIndex}.translations.${index}.name`);
    });
    const itemsToAdd = newTranslations.length - currentTranslations.length;
    for (let i = 0; i < itemsToAdd; i++) {
      form.insertListItem(`entries.${entryIndex}.translations`, { name: '' });
    }
    for (let index = 0; index < newTranslations.length; index++) {
      form.setFieldValue(`entries.${entryIndex}.translations.${index}.name`, newTranslations[index]);
    }
  };

  const handleSentencesGenerated = (entryIndex: number, newSentences: string[]) => {
    const currentSentences = form.getValues().entries[entryIndex]?.exampleSentences || [];
    currentSentences.forEach((_, index) => {
      form.clearFieldError(`entries.${entryIndex}.exampleSentences.${index}.sentence`);
    });
    const itemsToAdd = newSentences.length - currentSentences.length;
    for (let i = 0; i < itemsToAdd; i++) {
      form.insertListItem(`entries.${entryIndex}.exampleSentences`, { sentence: '' });
    }
    for (let index = 0; index < newSentences.length; index++) {
      form.setFieldValue(`entries.${entryIndex}.exampleSentences.${index}.sentence`, newSentences[index]);
    }
  };

  const removeTranslation = (entryIndex: number, translationIndex: number) => {
    form.removeListItem(`entries.${entryIndex}.translations`, translationIndex);
    setTimeout(() => {
      const remainingTranslations = form.getValues().entries[entryIndex].translations.length;
      if (remainingTranslations === 0) {
        return;
      }

      setFocusTranslation({ entryIndex, translationIndex: Math.max(0, translationIndex - 1) });
    }, 0);
  };

  const removeSentence = (entryIndex: number, sentenceIndex: number) => {
    form.removeListItem(`entries.${entryIndex}.exampleSentences`, sentenceIndex);
    setTimeout(() => {
      const remainingSentences = form.getValues().entries[entryIndex].exampleSentences.length - 1;
      if (remainingSentences === 0) {
        return;
      }

      setFocusSentence({ entryIndex, sentenceIndex: Math.max(0, sentenceIndex - 1) });
    }, 0);
  };

  const handleSubmit = (values: FormValues) => {
    if (mode === 'create') {
      createSetMutation.mutate(
        {
          setName: values.setName,
          entries: values.entries.map((entry) => ({
            word: entry.word.trim(),
            wordType: entry.wordType,
            translations: entry.translations.map((translation) => translation.name.trim()),
            exampleSentences: entry.exampleSentences.map((s) => s.sentence.trim()),
          })),
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Set created successfully',
              color: 'green',
              position: 'top-center',
            });
            navigate('/sets');
          },
          onError: () => {
            notifications.show({
              title: 'Error Creating Set',
              message: 'Failed to create set',
              color: 'red',
              position: 'top-center',
            });
          },
        },
      );
    } else {
      if (!setId) {
        return;
      }

      updateSetMutation.mutate(
        {
          setId,
          data: {
            setName: values.setName,
            entries: values.entries.map((entry) => ({
              word: entry.word.trim(),
              wordType: entry.wordType,
              translations: entry.translations.map((translation) => translation.name.trim()),
              exampleSentences: entry.exampleSentences.map((s) => s.sentence.trim()),
            })),
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Set updated successfully',
              color: 'green',
              position: 'top-center',
            });
            navigate('/sets');
          },
          onError: () => {
            notifications.show({
              title: 'Error Updating Set',
              message: 'Failed to update set',
              color: 'red',
              position: 'top-center',
            });
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <Stack pos="relative" mih="12rem">
        <LoadingOverlay visible />
      </Stack>
    );
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            label="Set Name"
            placeholder="Enter set name..."
            size="md"
            {...form.getInputProps('setName')}
            key={form.key('setName')}
          />

          <Divider label="Vocabulary Entries" labelPosition="center" />

          {form.getValues().entries.map((entry, entryIndex) => (
            <Paper key={entryIndex} p={{ base: 'sm', md: 'md' }} withBorder>
              <Stack gap="sm">
                <Group wrap="wrap" align="top">
                  <TextInput
                    ref={(el) => {
                      englishWordRefs.current[entryIndex] = el;
                    }}
                    label="English Word"
                    placeholder="Enter English word..."
                    style={{ flex: 1, minWidth: '200px' }}
                    size="md"
                    {...form.getInputProps(`entries.${entryIndex}.word`)}
                    lang="en"
                    spellCheck
                    key={form.key(`entries.${entryIndex}.word`)}
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
                    {...form.getInputProps(`entries.${entryIndex}.wordType`)}
                    key={form.key(`entries.${entryIndex}.wordType`)}
                  />
                  {form.getValues().entries.length > 1 && (
                    <>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeEntry(entryIndex)}
                        mt={{ base: '0', md: '1.8em' }}
                        visibleFrom="sm"
                        aria-label={`Remove entry ${entryIndex + 1}`}>
                        <IconTrash size={16} />
                      </ActionIcon>
                      <Button
                        color="red"
                        variant="light"
                        size="xs"
                        hiddenFrom="sm"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => removeEntry(entryIndex)}>
                        Remove Entry
                      </Button>
                    </>
                  )}
                </Group>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Translations
                  </Text>
                  {(entry.translations || []).map((_, translationIndex) => (
                    <Group key={translationIndex} mb="xs" wrap="nowrap" align="top">
                      <TextInput
                        ref={(el) => {
                          if (!translationRefs.current[entryIndex]) {
                            translationRefs.current[entryIndex] = [];
                          }
                          translationRefs.current[entryIndex][translationIndex] = el;
                        }}
                        placeholder="Enter translation..."
                        style={{ flex: 1 }}
                        size="md"
                        {...form.getInputProps(`entries.${entryIndex}.translations.${translationIndex}.name`)}
                        lang="pl"
                        spellCheck
                        key={form.key(`entries.${entryIndex}.translations.${translationIndex}.name`)}
                      />
                      {(entry.translations || []).length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeTranslation(entryIndex, translationIndex)}
                          aria-label={`Remove translation ${translationIndex + 1}`}
                          mt="7px">
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                  <Group gap="xs">
                    <Button
                      w={180}
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => addTranslation(entryIndex)}>
                      Add Translation
                    </Button>
                    <GenerateTranslationsButton
                      form={form}
                      entryIndex={entryIndex}
                      onTranslationsGenerated={(newTranslations) =>
                        handleTranslationsGenerated(entryIndex, newTranslations)
                      }
                    />
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Example Sentences
                  </Text>
                  {(entry.exampleSentences || []).map((_, sentenceIndex) => (
                    <Group key={sentenceIndex} mb="xs" wrap="nowrap" align="top">
                      <TextInput
                        ref={(el) => {
                          if (!sentenceRefs.current[entryIndex]) {
                            sentenceRefs.current[entryIndex] = [];
                          }
                          sentenceRefs.current[entryIndex][sentenceIndex] = el;
                        }}
                        placeholder="Enter example sentence..."
                        style={{ flex: 1 }}
                        size="md"
                        {...form.getInputProps(`entries.${entryIndex}.exampleSentences.${sentenceIndex}.sentence`)}
                        lang="en"
                        spellCheck
                        key={form.key(`entries.${entryIndex}.exampleSentences.${sentenceIndex}.sentence`)}
                      />
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeSentence(entryIndex, sentenceIndex)}
                        aria-label={`Remove sentence ${sentenceIndex + 1}`}
                        mt="7px">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                  <Group gap="xs">
                    <Button
                      w={180}
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => addSentence(entryIndex)}>
                      Add Sentence
                    </Button>
                    <GenerateSentencesButton
                      form={form}
                      entryIndex={entryIndex}
                      onSentencesGenerated={(newSentences) => handleSentencesGenerated(entryIndex, newSentences)}
                    />
                  </Group>
                </div>
              </Stack>
            </Paper>
          ))}

          <Group justify="center">
            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addEntry} size="md">
              Add Another Word
            </Button>
          </Group>

          <Group justify="space-between" mt="xl" wrap="wrap">
            <Button variant="light" onClick={() => navigate(`/sets?page=${returnPage}`)} size="md">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={mode === 'create' ? createSetMutation.isPending : updateSetMutation.isPending}
              size="md">
              {mode === 'create' ? 'Create Set' : 'Update Set'}
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
