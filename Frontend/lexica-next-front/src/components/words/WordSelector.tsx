import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconPlus, IconSearch, IconSelector, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCreateWord, useWords, type WordRecordDto } from '../../hooks/api';
import classes from './WordsList.module.css';

interface SelectedWord {
  wordId: string;
  word: string;
  wordType: string;
}

interface WordSelectorProps {
  selectedWords: SelectedWord[];
  onWordsChange: (words: SelectedWord[]) => void;
}

type SortField = 'word' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, currentField, currentOrder, onSort }: SortableHeaderProps) {
  const isActive = field === currentField;
  const Icon = isActive ? (currentOrder === 'asc' ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <UnstyledButton onClick={() => onSort(field)} className={classes.sortableHeader}>
      <Group gap={4} wrap="nowrap">
        <Text fw={700} fz="sm">
          {label}
        </Text>
        <Center>
          <Icon size={14} style={{ opacity: isActive ? 1 : 0.5 }} />
        </Center>
      </Group>
    </UnstyledButton>
  );
}

interface InlineWordFormValues {
  word: string;
  wordType: string;
  translations: string;
}

export function WordSelector({ selectedWords, onWordsChange }: WordSelectorProps) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const pageSize = 5;

  const {
    data: wordsData,
    isFetching,
    refetch,
  } = useWords({
    page,
    pageSize,
    sortingFieldName: sortField,
    sortingOrder: sortOrder,
    searchQuery: debouncedSearchQuery || undefined,
  });

  const createWordMutation = useCreateWord();

  const form = useForm<InlineWordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      word: '',
      wordType: 'noun',
      translations: '',
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
      translations: (value) => {
        if (!value?.trim()) {
          return 'At least one translation is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const oldSearch = debouncedSearchQuery;
      setDebouncedSearchQuery(searchQuery);
      if (oldSearch !== searchQuery) {
        setPage(1);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const isWordSelected = (wordId: string) => {
    return selectedWords.some((w) => w.wordId === wordId);
  };

  const handleWordToggle = (word: WordRecordDto) => {
    if (isWordSelected(word.wordId || '')) {
      onWordsChange(selectedWords.filter((w) => w.wordId !== word.wordId));
    } else {
      onWordsChange([
        ...selectedWords,
        {
          wordId: word.wordId || '',
          word: word.word || '',
          wordType: word.wordType || '',
        },
      ]);
    }
  };

  const handleRemoveSelectedWord = (wordId: string) => {
    onWordsChange(selectedWords.filter((w) => w.wordId !== wordId));
  };

  const handleCreateWord = (values: InlineWordFormValues) => {
    const translations = values.translations
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createWordMutation.mutate(
      {
        word: values.word.trim(),
        wordType: values.wordType,
        translations,
        exampleSentences: [],
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Word created successfully',
            color: 'green',
            position: 'top-center',
          });
          setCreateModalOpened(false);
          form.reset();
          refetch();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create word',
            color: 'red',
            position: 'top-center',
          });
        },
      },
    );
  };

  const words = wordsData?.data || [];
  const totalCount = Number(wordsData?.count) || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const rows = words.map((word) => (
    <Table.Tr key={word.wordId}>
      <Table.Td style={{ width: '2.5rem' }}>
        <Checkbox
          checked={isWordSelected(word.wordId || '')}
          onChange={() => handleWordToggle(word)}
          aria-label={`Select ${word.word}`}
        />
      </Table.Td>
      <Table.Td>
        <Text>{word.word}</Text>
      </Table.Td>
      <Table.Td className={classes.wordTypeCol}>
        <Badge size="sm" variant="light">
          {word.wordType}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create New Word"
        centered
        size="md">
        <form onSubmit={form.onSubmit(handleCreateWord)}>
          <Stack gap="md">
            <Group wrap="wrap" align="top">
              <TextInput
                label="English Word"
                placeholder="Enter word..."
                style={{ flex: 1, minWidth: '150px' }}
                {...form.getInputProps('word')}
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
                w={150}
                {...form.getInputProps('wordType')}
                key={form.key('wordType')}
              />
            </Group>
            <TextInput
              label="Translations"
              description="Separate multiple translations with commas"
              placeholder="translation1, translation2..."
              {...form.getInputProps('translations')}
              key={form.key('translations')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createWordMutation.isPending}>
                Create Word
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Stack gap="md">
        {selectedWords.length > 0 && (
          <Paper p="sm" withBorder>
            <Text size="sm" fw={500} mb="xs">
              Selected Words ({selectedWords.length}):
            </Text>
            <Group gap="xs" wrap="wrap">
              {selectedWords.map((word) => (
                <Badge
                  key={word.wordId}
                  variant="filled"
                  size="lg"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="white"
                      onClick={() => handleRemoveSelectedWord(word.wordId)}>
                      <IconX size={12} />
                    </ActionIcon>
                  }>
                  {word.word} ({word.wordType})
                </Badge>
              ))}
            </Group>
          </Paper>
        )}

        <Group gap="sm">
          <Button leftSection={<IconPlus size={16} />} variant="light" onClick={() => setCreateModalOpened(true)}>
            Create New Word
          </Button>
          <TextInput
            placeholder="Search words..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '100px' }}
          />
        </Group>

        <Box pos="relative" mih="15rem">
          <LoadingOverlay visible={isFetching} />
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '2.5rem' }} />
                  <Table.Th>
                    <SortableHeader
                      label="Word"
                      field="word"
                      currentField={sortField}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>Word Type</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Text ta="center" c="dimmed" py="md">
                        {debouncedSearchQuery
                          ? 'No words found matching your search.'
                          : 'No words available. Create your first word!'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
          </Group>
        )}
      </Stack>
    </>
  );
}
