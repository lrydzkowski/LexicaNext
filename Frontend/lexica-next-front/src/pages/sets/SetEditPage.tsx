import { useEffect, useState } from 'react';
import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { api, type EntryDto } from '../../services/api';

interface FormValues {
  setName: string;
  entries: EntryDto[];
}

export function SetEditPage() {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormValues>({
    initialValues: {
      setName: '',
      entries: [],
    },
    validate: {
      setName: (value) => (value.trim() === '' ? 'Set name is required' : null),
      entries: {
        word: (value) => (value.trim() === '' ? 'Word is required' : null),
        translations: (value) => (value.some((t) => t.trim() === '') ? 'All translations are required' : null),
      },
    },
  });

  useEffect(() => {
    const fetchSet = async () => {
      if (!setId) return;

      try {
        const set = await api.getSet(setId);
        form.setValues({
          setName: set.name,
          entries: set.entries,
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to load set',
          color: 'red',
        });
        navigate('/sets');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSet();
  }, [setId]);

  const addEntry = () => {
    form.insertListItem('entries', { word: '', wordType: 'noun', translations: [''] });
  };

  const removeEntry = (index: number) => {
    form.removeListItem('entries', index);
  };

  const addTranslation = (entryIndex: number) => {
    form.insertListItem(`entries.${entryIndex}.translations`, '');
  };

  const removeTranslation = (entryIndex: number, translationIndex: number) => {
    form.removeListItem(`entries.${entryIndex}.translations`, translationIndex);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!setId) return;

    try {
      setLoading(true);
      await api.updateSet(setId, {
        setName: values.setName,
        entries: values.entries.map((entry) => ({
          ...entry,
          translations: entry.translations.filter((t) => t.trim() !== ''),
        })),
      });

      notifications.show({
        title: 'Success',
        message: 'Set updated successfully',
        color: 'green',
      });

      navigate('/sets');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update set',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <>
      <Container p={0}>
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} mb="sm" mt="sm">
              Edit Set
            </Title>
          </Group>

          <Paper>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Set Name"
                  placeholder="Enter set name..."
                  required
                  size="md"
                  {...form.getInputProps('setName')}
                />

                <Divider label="Vocabulary Entries" labelPosition="center" />

                {form.values.entries.map((entry, entryIndex) => (
                  <Paper key={entryIndex} p={{ base: 'sm', md: 'md' }} withBorder>
                    <Stack gap="sm">
                      <Group wrap="wrap">
                        <TextInput
                          label="English Word"
                          placeholder="Enter English word..."
                          required
                          style={{ flex: 1, minWidth: '200px' }}
                          size="md"
                          {...form.getInputProps(`entries.${entryIndex}.word`)}
                        />
                        <Select
                          label="Word Type"
                          data={[
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
                        {entry.translations.map((_, translationIndex) => (
                          <Group key={translationIndex} mb="xs" wrap="nowrap">
                            <TextInput
                              placeholder="Enter translation..."
                              required
                              style={{ flex: 1 }}
                              size="md"
                              {...form.getInputProps(`entries.${entryIndex}.translations.${translationIndex}`)}
                            />
                            {entry.translations.length > 1 && (
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
                  <Button type="submit" loading={loading} size="md">
                    Update Set
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
