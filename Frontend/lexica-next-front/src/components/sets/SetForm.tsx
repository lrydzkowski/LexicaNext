import { useEffect, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { links } from '@/config/links';
import { useCreateSet, useUpdateSet, type GetSetResponse, type WordRecordDto } from '../../hooks/api';
import { WordFormSuccessData } from '../words/WordFormTypes';
import { CreateWordModal } from './CreateWordModal';
import { SelectWordsModal } from './SelectWordsModal';

interface SelectedWord {
  wordId: string;
  word: string;
  wordType: string;
}

interface FormValues {
  setName: string;
}

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
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const setNameInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
  const [selectModalOpened, { open: openSelectModal, close: closeSelectModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

  const selectedWordIds = useMemo(() => new Set(selectedWords.map((w) => w.wordId)), [selectedWords]);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      setName: mode === 'create' ? uuidv4() : '',
    },
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
    },
  });

  useEffect(() => {
    if (mode === 'edit' && set) {
      form.setValues({
        setName: set.name || '',
      });
      setSelectedWords(
        (set.entries || []).map((entry) => ({
          wordId: entry.wordId || '',
          word: entry.word || '',
          wordType: entry.wordType || '',
        })),
      );
      setTimeout(() => {
        setNameInputRef.current?.focus();
      }, 0);
    }
  }, [set, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setNameInputRef.current?.focus();
    }
  }, [mode]);

  const handleSelectWord = (word: WordRecordDto) => {
    if (!word.wordId) {
      return;
    }

    if (selectedWordIds.has(word.wordId)) {
      setSelectedWords(selectedWords.filter((w) => w.wordId !== word.wordId));
    } else {
      setSelectedWords([
        ...selectedWords,
        {
          wordId: word.wordId,
          word: word.word || '',
          wordType: word.wordType || '',
        },
      ]);
    }
  };

  const handleRemoveWord = (wordId: string) => {
    setSelectedWords(selectedWords.filter((w) => w.wordId !== wordId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) {
      return;
    }

    const newWords = [...selectedWords];
    [newWords[index - 1], newWords[index]] = [newWords[index], newWords[index - 1]];
    setSelectedWords(newWords);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedWords.length - 1) {
      return;
    }

    const newWords = [...selectedWords];
    [newWords[index], newWords[index + 1]] = [newWords[index + 1], newWords[index]];
    setSelectedWords(newWords);
  };

  const handleWordCreated = (data: WordFormSuccessData) => {
    setSelectedWords([
      ...selectedWords,
      {
        wordId: data.wordId,
        word: data.word,
        wordType: data.wordType,
      },
    ]);
  };

  const handleSubmit = (values: FormValues) => {
    if (selectedWords.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select at least one word for the set',
        color: 'red',
        position: 'top-center',
      });

      return;
    }

    const wordIds = selectedWords.map((w) => w.wordId);

    if (mode === 'create') {
      createSetMutation.mutate(
        {
          setName: values.setName,
          wordIds,
        },
        {
          onSuccess: () => {
            navigate(links.sets.getUrl());
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
            wordIds,
          },
        },
        {
          onSuccess: () => {
            navigate(links.sets.getUrl());
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
            ref={setNameInputRef}
            label="Set Name"
            placeholder="Enter set name..."
            size="md"
            {...form.getInputProps('setName')}
            key={form.key('setName')}
          />

          <Divider label="Words in Set" labelPosition="center" />

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Selected Words ({selectedWords.length})
              </Text>
              <Group gap="xs">
                <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={openSelectModal}>
                  Add Words
                </Button>
                <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />} onClick={openCreateModal}>
                  Create New Word
                </Button>
              </Group>
            </Group>

            {selectedWords.length === 0 ? (
              <Paper p="md" withBorder>
                <Text ta="center" c="dimmed" size="sm">
                  No words selected. Click "Add Words" to select words from your library.
                </Text>
              </Paper>
            ) : (
              <>
                <Box hiddenFrom="md">
                  {selectedWords.map((word, index) => (
                    <Paper key={word.wordId} p="md" withBorder mb="sm">
                      <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" mb="xs">
                            <Text size="sm" c="dimmed">
                              #{index + 1}
                            </Text>
                            <Badge size="sm" variant="light">
                              {word.wordType}
                            </Badge>
                          </Group>
                          <Text fw={600} fz="md" truncate>
                            {word.word}
                          </Text>
                        </div>
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            aria-label="Move up">
                            <IconChevronUp size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedWords.length - 1}
                            aria-label="Move down">
                            <IconChevronDown size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveWord(word.wordId)}
                            aria-label="Remove word">
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Box>
                <Table striped style={{ tableLayout: 'fixed' }} visibleFrom="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={60}>#</Table.Th>
                      <Table.Th>Word</Table.Th>
                      <Table.Th w={120}>Type</Table.Th>
                      <Table.Th w={100} style={{ textAlign: 'center' }}>
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedWords.map((word, index) => (
                      <Table.Tr key={word.wordId}>
                        <Table.Td w={60}>{index + 1}</Table.Td>
                        <Table.Td>
                          <Text fw={500} truncate="end">
                            {word.word}
                          </Text>
                        </Table.Td>
                        <Table.Td w={120}>
                          <Badge size="sm" variant="light">
                            {word.wordType}
                          </Badge>
                        </Table.Td>
                        <Table.Td w={100}>
                          <Group gap={4} justify="center">
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              aria-label="Move up">
                              <IconChevronUp size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === selectedWords.length - 1}
                              aria-label="Move down">
                              <IconChevronDown size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => handleRemoveWord(word.wordId)}
                              aria-label="Remove word">
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Stack>

          <Group justify="space-between" mt="xl" wrap="wrap">
            <Button variant="light" onClick={() => navigate(links.sets.getUrl({}, { returnPage }))} size="md" w={120}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={mode === 'create' ? createSetMutation.isPending : updateSetMutation.isPending}
              size="md"
              w={120}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>

      <SelectWordsModal
        opened={selectModalOpened}
        onClose={closeSelectModal}
        selectedWordIds={selectedWordIds}
        onSelectWord={handleSelectWord}
      />

      <CreateWordModal opened={createModalOpened} onClose={closeCreateModal} onSuccess={handleWordCreated} />
    </>
  );
}
