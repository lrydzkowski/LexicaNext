import { useEffect, useRef, useState } from 'react';
import { IconDots, IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
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
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { links } from '../../config/links';
import { useDeleteWord, useDeleteWords, useWords, type WordRecordDto } from '../../hooks/api';
import { formatDateTime } from '../../utils/date';
import { DeleteWordModal } from './DeleteWordModal';

export function WordsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const createButtonRef = useRef<HTMLAnchorElement | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    opened: boolean;
    wordId: string;
    wordText: string;
  }>({ opened: false, wordId: '', wordText: '' });

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

  const deleteWordMutation = useDeleteWord();
  const deleteWordsMutation = useDeleteWords();

  const words = wordsData?.data || [];
  const totalCount = wordsData?.count || 0;

  useEffect(() => {
    if (createButtonRef.current) {
      createButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const oldSearch = debouncedSearchQuery;
      setDebouncedSearchQuery(searchQuery);
      if (oldSearch !== searchQuery) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('page', '1');

          return newParams;
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error Loading Words',
        message: 'An unexpected error occurred',
        color: 'red',
        position: 'top-center',
      });
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

  const handleBulkDelete = () => {
    const count = selectedWordIds.size;
    modals.openConfirmModal({
      title: 'Delete Words',
      children: (
        <Text>
          Are you sure you want to delete {count} word{count > 1 ? 's' : ''}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const idsToDelete = Array.from(selectedWordIds);
        deleteWordsMutation.mutate(idsToDelete, {
          onSuccess: (failedCount) => {
            setSelectedWordIds(new Set());
            if (failedCount > 0) {
              notifications.show({
                title: 'Partial Failure',
                message: `Failed to delete ${failedCount} word${failedCount > 1 ? 's' : ''}`,
                color: 'red',
                position: 'top-center',
              });
            }
          },
          onError: () => {
            notifications.show({
              title: 'Error',
              message: 'Failed to delete words',
              color: 'red',
              position: 'top-center',
            });
          },
        });
      },
    });
  };

  const openDeleteModal = (wordId: string, wordText: string) => {
    setDeleteModalState({ opened: true, wordId, wordText });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ opened: false, wordId: '', wordText: '' });
  };

  const handleDelete = () => {
    deleteWordMutation.mutate(deleteModalState.wordId, {
      onSuccess: () => {
        closeDeleteModal();
        refetch();
      },
      onError: () => {
        notifications.show({
          title: 'Error Deleting Word',
          message: 'Failed to delete word',
          color: 'red',
          position: 'top-center',
        });
      },
    });
  };

  const totalPages = Math.ceil((totalCount as number) / pageSize);

  const WordActionMenu = ({ word }: { word: WordRecordDto }) => (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="light"
          color="blue"
          size="lg"
          aria-label={`Actions for ${word.word}`}
          onClick={(e) => e.stopPropagation()}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
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
        wordId={deleteModalState.wordId}
        wordText={deleteModalState.wordText}
        onConfirm={handleDelete}
        isDeleting={deleteWordMutation.isPending}
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
            onClick={handleBulkDelete}
            hiddenFrom="md">
            <IconTrash size={22} />
          </ActionIcon>
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            size="md"
            disabled={selectedWordIds.size === 0}
            onClick={handleBulkDelete}
            visibleFrom="md">
            Delete{selectedWordIds.size > 0 ? ` (${selectedWordIds.size})` : ''}
          </Button>
          <ActionIcon variant="light" size="xl" onClick={() => refetch()}>
            <IconRefresh size={22} />
          </ActionIcon>
          <TextInput
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
              words.map((word) => (
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
                        <WordActionMenu word={word} />
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
                words.map((word) => (
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
                        <WordActionMenu word={word} />
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
