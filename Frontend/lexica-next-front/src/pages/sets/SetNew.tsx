import { useState } from 'react';
import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import {
  ActionIcon,
  Button,
  Container,
  Divider,
  Group,
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

export function SetNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      setName: '',
      entries: [{ word: '', wordType: 'noun', translations: [''] }],
    },
    validate: {
      setName: (value) => (value.trim() === '' ? 'Set name is required' : null),
      entries: {
        word: (value) => (value.trim() === '' ? 'Word is required' : null),
        translations: (value) => (value.some((t) => t.trim() === '') ? 'All translations are required' : null),
      },
    },
  });

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
    try {
      setLoading(true);
      await api.createSet({
        setName: values.setName,
        entries: values.entries.map((entry) => ({
          ...entry,
          translations: entry.translations.filter((t) => t.trim() !== ''),
        })),
      });

      notifications.show({
        title: 'Success',
        message: 'Set created successfully',
        color: 'green',
      });

      navigate('/sets');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create set',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container size="md">
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/sets')} aria-label="Go back to sets">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2} mb="sm" mt="sm">
              Create New Set
            </Title>
          </Group>

          <Paper p={{ base: 0 }}>
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
                          {...form.getInputProps(`entries.${entryIndex}.wordType`)}
                        />
                        {form.values.entries.length > 1 && (
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => removeEntry(entryIndex)}
                            mt="xl"
                            aria-label={`Remove entry ${entryIndex + 1}`}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>

                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Translations
                        </Text>
                        {entry.translations.map((translation, translationIndex) => (
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
                    Create Set
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
