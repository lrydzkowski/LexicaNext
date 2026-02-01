import { useEffect, useMemo, useRef, useState } from 'react';
import { IconDots, IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { links } from '../../config/links';
import { SHORTCUT_KEYS } from '../../config/shortcuts';
import { useDeleteWords, useWords, type WordRecordDto } from '../../hooks/api';
import { generateRowHandlers, useShortcuts } from '../../hooks/useShortcuts';
import { showErrorNotification } from '../../services/error-notifications';
import { formatDateTime } from '../../utils/date';
import { DeleteWordModal } from './DeleteWordModal';

export function WordsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 150);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const createButtonRef = useRef<HTMLAnchorElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const actionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    opened: boolean;
    words: { wordId: string; wordName: string }[];
  }>({ opened: false, words: [] });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const sortingFieldName = 'createdAt';
  const sortingOrder = 'desc';

  const {
    data: wordsData,
    isFetching,
    error,
    refetch,
  } = useWords({
    page: currentPage,
    pageSize,
    sortingFieldName,
    sortingOrder,
    searchQuery: debouncedSearchQuery || undefined,
  });

  const deleteWordsMutation = useDeleteWords();

  const words = wordsData?.data || [];
  const totalCount = wordsData?.count || 0;

  useEffect(() => {
    actionButtonRefs.current = [];
  }, [words]);

  useEffect(() => {
    if (createButtonRef.current) {
      createButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '1');

      return newParams;
    });
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Words', error);
    }
  }, [error]);

  useEffect(() => {
    setSelectedWordIds(new Set());
  }, [currentPage, debouncedSearchQuery]);

  const toggleWordSelection = (wordId: string) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const toggleAllWords = () => {
    if (selectedWordIds.size === words.length) {
      setSelectedWordIds(new Set());
    } else {
      setSelectedWordIds(new Set(words.map((w) => w.wordId || '')));
    }
  };

  const openDeleteModal = (wordId: string, wordName: string) => {
    setDeleteModalState({ opened: true, words: [{ wordId, wordName }] });
  };

  const openBulkDeleteModal = () => {
    const wordsToDelete = words
      .filter((w) => selectedWordIds.has(w.wordId || ''))
      .map((w) => ({ wordId: w.wordId || '', wordName: w.word || '' }));
    setDeleteModalState({ opened: true, words: wordsToDelete });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ opened: false, words: [] });
  };

  const handleDelete = () => {
    if (!deleteModalState.opened || deleteModalState.words.length === 0) {
      return;
    }

    const wordIds = deleteModalState.words.map((w) => w.wordId);

    deleteWordsMutation.mutate(wordIds, {
      onSuccess: () => {
        closeDeleteModal();
        setSelectedWordIds(new Set());
      },
      onError: (error) => {
        showErrorNotification('Error Deleting Words', error);
      },
    });
  };

  const totalPages = Math.ceil((totalCount as number) / pageSize);

  const shortcutHandlers = useMemo(
    () => [
      {
        key: SHORTCUT_KEYS.CREATE_NEW,
        handler: () => navigate(links.newWord.getUrl({}, { returnPage: currentPage.toString() })),
      },
      {
        key: SHORTCUT_KEYS.FOCUS_SEARCH,
        handler: () => searchInputRef.current?.focus(),
      },
      ...generateRowHandlers((index) => actionButtonRefs.current[index]?.focus()),
    ],
    [navigate, currentPage],
  );

  useShortcuts('words-list', shortcutHandlers);

  const WordActionMenu = ({ word, index }: { word: WordRecordDto; index: number }) => (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          ref={(el) => {
            actionButtonRefs.current[index] = el;
          }}
          variant="light"
          color="blue"
          size="lg"
          aria-label={`Actions for ${word.word}`}
          onClick={(e) => e.stopPropagation()}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        <Menu.Label>Word Management</Menu.Label>
        <Menu.Item
          leftSection={<IconEdit size={16} />}
          component={Link}
          to={links.editWord.getUrl({ wordId: word.wordId }, { returnPage: currentPage.toString() })}>
          Edit Word
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTrash size={16} />}
          color="red"
          onClick={() => openDeleteModal(word.wordId || '', word.word || '')}>
          Delete Word
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <DeleteWordModal
        opened={deleteModalState.opened}
        onClose={closeDeleteModal}
        words={deleteModalState.words}
        onConfirm={handleDelete}
        isDeleting={deleteWordsMutation.isPending}
      />

      <Stack gap="md">
        <Group wrap="wrap" gap="sm">
          <ActionIcon
            component={Link}
            to={links.newWord.getUrl({}, { returnPage: currentPage.toString() })}
            size="xl"
            hiddenFrom="md">
            <IconPlus size={22} />
          </ActionIcon>
          <Button
            ref={createButtonRef}
            leftSection={<IconPlus size={16} />}
            component={Link}
            to={links.newWord.getUrl({}, { returnPage: currentPage.toString() })}
            size="md"
            visibleFrom="md">
            <Text>Create New Word</Text>
          </Button>
          <ActionIcon
            color="red"
            size="xl"
            disabled={selectedWordIds.size === 0}
            loading={deleteWordsMutation.isPending}
            onClick={openBulkDeleteModal}
            hiddenFrom="md">
            <IconTrash size={22} />
          </ActionIcon>
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            size="md"
            disabled={selectedWordIds.size === 0}
            loading={deleteWordsMutation.isPending}
            onClick={openBulkDeleteModal}
            visibleFrom="md">
            Delete{selectedWordIds.size > 0 ? ` (${selectedWordIds.size})` : ''}
          </Button>
          <ActionIcon variant="light" size="xl" onClick={() => refetch()}>
            <IconRefresh size={22} />
          </ActionIcon>
          <TextInput
            ref={searchInputRef}
            placeholder="Search words..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '100px' }}
            size="md"
          />
        </Group>

        <Box pos="relative">
          <LoadingOverlay visible={isFetching} />
          <Box hiddenFrom="md">
            {words.length > 0 ? (
              words.map((word, index) => (
                <Paper
                  p="md"
                  withBorder
                  mb="sm"
                  key={word.wordId}
                  onClick={() => toggleWordSelection(word.wordId || '')}
                  style={{ cursor: 'pointer' }}>
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Checkbox
                        checked={selectedWordIds.has(word.wordId || '')}
                        onChange={() => toggleWordSelection(word.wordId || '')}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${word.word}`}
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
                          Edited: {word.editedAt ? formatDateTime(word.editedAt) : '-'}
                        </Text>
                      </div>
                      <Box>
                        <WordActionMenu word={word} index={index} />
                      </Box>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                {debouncedSearchQuery
                  ? 'No words found matching your search.'
                  : 'No words created yet. Create your first word to get started!'}
              </Text>
            )}
          </Box>
          <Table striped highlightOnHover style={{ tableLayout: 'fixed' }} visibleFrom="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    checked={words.length > 0 && selectedWordIds.size === words.length}
                    indeterminate={selectedWordIds.size > 0 && selectedWordIds.size < words.length}
                    onChange={toggleAllWords}
                    aria-label="Select all words"
                  />
                </Table.Th>
                <Table.Th>Word</Table.Th>
                <Table.Th w={100}>Word Type</Table.Th>
                <Table.Th w={180}>Created</Table.Th>
                <Table.Th w={180}>Edited</Table.Th>
                <Table.Th w={80} style={{ textAlign: 'center' }}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {words.length > 0 ? (
                words.map((word, index) => (
                  <Table.Tr
                    key={word.wordId}
                    onClick={() => toggleWordSelection(word.wordId || '')}
                    style={{ cursor: 'pointer' }}>
                    <Table.Td w={40} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedWordIds.has(word.wordId || '')}
                        onChange={() => toggleWordSelection(word.wordId || '')}
                        aria-label={`Select ${word.word}`}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text truncate="end">{word.word}</Text>
                    </Table.Td>
                    <Table.Td w={100}>
                      <Badge size="sm" variant="light">
                        {word.wordType}
                      </Badge>
                    </Table.Td>
                    <Table.Td w={180}>
                      <Text>{formatDateTime(word.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td w={180}>
                      <Text>{word.editedAt ? formatDateTime(word.editedAt) : '-'}</Text>
                    </Table.Td>
                    <Table.Td w={80}>
                      <Group justify="center">
                        <WordActionMenu word={word} index={index} />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">
                      {debouncedSearchQuery
                        ? 'No words found matching your search.'
                        : 'No words created yet. Create your first word to get started!'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>

        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={(page) => {
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set('page', page.toString());

                return newParams;
              });
            }}
            size="md"
          />
        </Group>
      </Stack>
    </>
  );
}
