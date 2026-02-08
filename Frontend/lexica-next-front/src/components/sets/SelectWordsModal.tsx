import { useEffect, useMemo, useRef, useState } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { SHORTCUT_KEYS } from '@/config/shortcuts';
import { generateRowHandlers, useShortcuts } from '@/hooks/useShortcuts';
import { formatDateTime } from '@/utils/date';
import { useWords, type WordRecordDto } from '../../hooks/api';

interface SelectWordsModalProps {
  opened: boolean;
  onClose: () => void;
  selectedWordIds: Set<string>;
  onSelectWord: (word: WordRecordDto) => void;
}

interface SelectWordsModalContentProps {
  onClose: () => void;
  selectedWordIds: Set<string>;
  onSelectWord: (word: WordRecordDto) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

function SelectWordsModalContent({
  onClose,
  selectedWordIds,
  onSelectWord,
  searchInputRef,
}: SelectWordsModalContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: wordsData, isFetching } = useWords({
    page: currentPage,
    pageSize,
    sortingFieldName: 'createdAt',
    sortingOrder: 'desc',
    searchQuery: debouncedSearchQuery || undefined,
  });

  const words = wordsData?.data || [];
  const totalCount = wordsData?.count || 0;
  const totalPages = Math.ceil((totalCount as number) / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const shortcutHandlers = useMemo(
    () => [
      {
        key: SHORTCUT_KEYS.FOCUS_SEARCH,
        handler: () => searchInputRef.current?.focus(),
      },
      {
        key: SHORTCUT_KEYS.CANCEL,
        handler: onClose,
      },
      {
        key: SHORTCUT_KEYS.SAVE,
        handler: onClose,
      },
      ...generateRowHandlers((index) => {
        if (index < words.length) {
          onSelectWord(words[index]);
        }
      }),
    ],
    [onClose, words, onSelectWord, searchInputRef],
  );

  useShortcuts('select-words', shortcutHandlers);

  return (
    <Container size="md" p={0}>
      <Stack gap="md">
        <TextInput
          ref={searchInputRef}
          placeholder="Search words..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightSection={
            searchQuery ? (
              <ActionIcon variant="subtle" size="sm" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
        />
        <Box pos="relative" mb={20}>
          <LoadingOverlay visible={isFetching} />
          {words.length > 0 ? (
            <>
              <Box hiddenFrom="md">
                {words.map((word) => {
                  const isSelected = word.wordId ? selectedWordIds.has(word.wordId) : false;

                  return (
                    <Paper
                      key={word.wordId}
                      p="md"
                      withBorder
                      mb="sm"
                      style={{ cursor: 'pointer' }}
                      bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                      onClick={() => onSelectWord(word)}>
                      <Group justify="space-between" align="flex-start">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onSelectWord(word)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text fw={600} fz="md" truncate>
                            {word.word}
                          </Text>
                          <Group gap="xs" mt="xs">
                            <Badge size="sm" variant="light">
                              {word.wordType}
                            </Badge>
                          </Group>
                          <Text fz="xs" c="dimmed" mt="xs">
                            Created: {formatDateTime(word.createdAt)}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            Edited: {word.updatedAt ? formatDateTime(word.updatedAt) : '-'}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                  );
                })}
              </Box>
              <Table striped highlightOnHover style={{ tableLayout: 'fixed' }} visibleFrom="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={50} />
                    <Table.Th>Word</Table.Th>
                    <Table.Th w={100}>Type</Table.Th>
                    <Table.Th w={150}>Created</Table.Th>
                    <Table.Th w={150}>Edited</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {words.map((word) => {
                    const isSelected = word.wordId ? selectedWordIds.has(word.wordId) : false;

                    return (
                      <Table.Tr
                        key={word.wordId}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelectWord(word)}
                        bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}>
                        <Table.Td w={50}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => onSelectWord(word)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500} truncate="end">
                            {word.word}
                          </Text>
                        </Table.Td>
                        <Table.Td w={100}>
                          <Badge size="sm" variant="light">
                            {word.wordType}
                          </Badge>
                        </Table.Td>
                        <Table.Td w={150}>
                          <Text size="sm" c="dimmed">
                            {formatDateTime(word.createdAt)}
                          </Text>
                        </Table.Td>
                        <Table.Td w={150}>
                          <Text size="sm" c="dimmed">
                            {word.updatedAt ? formatDateTime(word.updatedAt) : '-'}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </>
          ) : (
            <>
              <Box hiddenFrom="md">
                <Text ta="center" c="dimmed" py="xl">
                  {debouncedSearchQuery
                    ? 'No words found matching your search.'
                    : 'No words available. Create some words first!'}
                </Text>
              </Box>
              <Text ta="center" c="dimmed" py="xl" visibleFrom="md">
                {debouncedSearchQuery
                  ? 'No words found matching your search.'
                  : 'No words available. Create some words first!'}
              </Text>
            </>
          )}
        </Box>
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" />
          </Group>
        )}
        <Group justify="flex-end">
          <Button size="md" onClick={onClose}>
            Done
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

export function SelectWordsModal({ opened, onClose, selectedWordIds, onSelectWord }: SelectWordsModalProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleModalEntered = () => {
    searchInputRef.current?.focus();
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      size="lg"
      fullScreen
      returnFocus
      transitionProps={{ onEntered: handleModalEntered }}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Container size="md" p={0} w="100%">
            <Group justify="space-between">
              <Title size={16} fw={500}>
                Select Words
              </Title>
              <Modal.CloseButton />
            </Group>
          </Container>
        </Modal.Header>
        <Modal.Body>
          {opened && (
            <SelectWordsModalContent
              onClose={onClose}
              selectedWordIds={selectedWordIds}
              onSelectWord={onSelectWord}
              searchInputRef={searchInputRef}
            />
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
