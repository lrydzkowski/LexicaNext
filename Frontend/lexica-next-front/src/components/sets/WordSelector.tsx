import { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { links } from '../../config/links';
import { useWords, type WordRecordDto } from '../../hooks/api';

interface SelectedWord {
  wordId: string;
  word: string;
  wordType: string;
}

interface WordSelectorProps {
  selectedWords: SelectedWord[];
  onWordsChange: (words: SelectedWord[]) => void;
}

export function WordSelector({ selectedWords, onWordsChange }: WordSelectorProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: wordsData, isFetching } = useWords({
    page: currentPage,
    pageSize,
    sortingFieldName: 'word',
    sortingOrder: 'asc',
    searchQuery: debouncedSearchQuery || undefined,
  });

  const words = wordsData?.data || [];
  const totalCount = wordsData?.count || 0;
  const totalPages = Math.ceil((totalCount as number) / pageSize);

  const selectedWordIds = useMemo(() => new Set(selectedWords.map((w) => w.wordId)), [selectedWords]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => {
      setDebouncedSearchQuery(value);
      setCurrentPage(1);
    }, 150);
  };

  const handleSelectWord = (word: WordRecordDto) => {
    if (!word.wordId) {
      return;
    }

    if (selectedWordIds.has(word.wordId)) {
      onWordsChange(selectedWords.filter((w) => w.wordId !== word.wordId));
    } else {
      onWordsChange([
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
    onWordsChange(selectedWords.filter((w) => w.wordId !== wordId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) {
      return;
    }

    const newWords = [...selectedWords];
    [newWords[index - 1], newWords[index]] = [newWords[index], newWords[index - 1]];
    onWordsChange(newWords);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedWords.length - 1) {
      return;
    }

    const newWords = [...selectedWords];
    [newWords[index], newWords[index + 1]] = [newWords[index + 1], newWords[index]];
    onWordsChange(newWords);
  };

  return (
    <>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Selected Words ({selectedWords.length})
          </Text>
          <Group gap="xs">
            <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={open}>
              Add Words
            </Button>
            <Button
              component={Link}
              to={links.newWord.url}
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}>
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
          <Paper withBorder>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 60 }}>#</Table.Th>
                  <Table.Th>Word</Table.Th>
                  <Table.Th style={{ width: 120 }}>Type</Table.Th>
                  <Table.Th style={{ width: 100, textAlign: 'center' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedWords.map((word, index) => (
                  <Table.Tr key={word.wordId}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>{word.word}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light">
                        {word.wordType}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
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
          </Paper>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title="Select Words" size="lg">
        <Stack gap="md">
          <TextInput
            placeholder="Search words..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            rightSection={
              searchQuery ? (
                <ActionIcon variant="subtle" size="sm" onClick={() => handleSearchChange('')} aria-label="Clear search">
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />

          <Box pos="relative" mih={300}>
            <LoadingOverlay visible={isFetching} />

            {words.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                {debouncedSearchQuery
                  ? 'No words found matching your search.'
                  : 'No words available. Create some words first!'}
              </Text>
            ) : (
              <ScrollArea h={350}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 50 }} />
                      <Table.Th>Word</Table.Th>
                      <Table.Th style={{ width: 120 }}>Type</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {words.map((word) => {
                      const isSelected = word.wordId ? selectedWordIds.has(word.wordId) : false;

                      return (
                        <Table.Tr
                          key={word.wordId}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSelectWord(word)}
                          bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}>
                          <Table.Td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectWord(word)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Text fw={500}>{word.word}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge size="sm" variant="light">
                              {word.wordType}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Box>

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" />
            </Group>
          )}

          <Group justify="flex-end">
            <Button onClick={close}>Done</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
