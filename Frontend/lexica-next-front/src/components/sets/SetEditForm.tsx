import { useEffect, useRef } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
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
import { useSet, useUpdateSet } from '../../hooks/api';

interface FormValues {
  setName: string;
  entries: FormEntry[];
}

interface FormEntry {
  word: string;
  wordType: string;
  translations: FormTranslation[];
}

interface FormTranslation {
  name: string;
}

export function SetEditForm() {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const { data: set, isLoading: initialLoading, error } = useSet(setId!);
  const updateSetMutation = useUpdateSet();
  const firstEnglishWordFieldRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      setName: '',
      entries: [],
    },
    validate: {
      setName: (value) => {
        if (!value?.trim()) return 'Set name is required';
        if (value.trim().length < 1) return 'Set name must not be empty';
        if (value.trim().length > 200) return 'Set name must be less than 200 characters';
        return null;
      },
      entries: {
        word: (value) => {
          if (!value?.trim()) return 'Word is required';
          if (value.trim().length < 1) return 'Word must not be empty';
          if (value.trim().length > 200) return 'Word must be less than 200 characters';
          return null;
        },
        translations: {
          name: (value) => {
            if (!value?.trim()) return 'Translation is required';
            if (value.trim().length < 1) return 'Translation must not be empty';
            if (value.trim().length > 200) return 'Translation must be less than 200 characters';
            return null;
          },
        },
      },
    },
  });

  useEffect(() => {
    if (set) {
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
          })) || [],
      });
      setTimeout(() => {
        if (firstEnglishWordFieldRef.current) {
          firstEnglishWordFieldRef.current.focus();
        }
      }, 0);
    }
  }, [set]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load set',
        color: 'red',
      });
      navigate('/sets');
    }
  }, [error, navigate]);

  const addEntry = () => {
    form.insertListItem('entries', { word: '', wordType: 'noun', translations: [{ name: '' }] });
  };

  const removeEntry = (index: number) => {
    form.removeListItem('entries', index);
  };

  const addTranslation = (entryIndex: number) => {
    form.insertListItem(`entries.${entryIndex}.translations`, { name: '' });
  };

  const removeTranslation = (entryIndex: number, translationIndex: number) => {
    form.removeListItem(`entries.${entryIndex}.translations`, translationIndex);
  };

  const handleSubmit = (values: FormValues) => {
    if (!setId) return;

    updateSetMutation.mutate(
      {
        setId,
        data: {
          setName: values.setName,
          entries: values.entries.map((entry) => ({
            word: entry.word.trim(),
            wordType: entry.wordType,
            translations: entry.translations.map((translation) => translation.name.trim()),
          })),
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Set updated successfully',
            color: 'green',
          });
          navigate('/sets');
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update set',
            color: 'red',
          });
        },
      },
    );
  };

  if (initialLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput label="Set Name" placeholder="Enter set name..." size="md" {...form.getInputProps('setName')} />

          <Divider label="Vocabulary Entries" labelPosition="center" />

          {form.values.entries.map((entry, entryIndex) => (
            <Paper key={entryIndex} p={{ base: 'sm', md: 'md' }} withBorder>
              <Stack gap="sm">
                <Group wrap="wrap">
                  <TextInput
                    ref={entryIndex === 0 ? firstEnglishWordFieldRef : undefined}
                    label="English Word"
                    placeholder="Enter English word..."
                    style={{ flex: 1, minWidth: '200px' }}
                    size="md"
                    {...form.getInputProps(`entries.${entryIndex}.word`)}
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
                  />
                  {form.values.entries.length > 1 && (
                    <>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeEntry(entryIndex)}
                        mt={{ base: '0', md: '1.4rem' }}
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
                        Remove Translation
                      </Button>
                    </>
                  )}
                </Group>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Translations
                  </Text>
                  {(entry.translations || []).map((_, translationIndex) => (
                    <Group key={translationIndex} mb="xs" wrap="nowrap">
                      <TextInput
                        placeholder="Enter translation..."
                        style={{ flex: 1 }}
                        size="md"
                        {...form.getInputProps(`entries.${entryIndex}.translations.${translationIndex}.name`)}
                      />
                      {(entry.translations || []).length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeTranslation(entryIndex, translationIndex)}
                          aria-label={`Remove translation ${translationIndex + 1}`}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => addTranslation(entryIndex)}>
                    Add Translation
                  </Button>
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
            <Button variant="light" onClick={() => navigate('/sets')} size="md">
              Cancel
            </Button>
            <Button type="submit" loading={updateSetMutation.isPending} size="md">
              Update Set
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
