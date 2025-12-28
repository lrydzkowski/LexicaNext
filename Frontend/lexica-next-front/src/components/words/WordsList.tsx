import { useEffect, useRef, useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSelector,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { links } from '../../config/links';
import { useDeleteWord, useWords, type WordRecordDto } from '../../hooks/api';
import { formatDateTime } from '../../utils/date';
import { DeleteWordModal } from './DeleteWordModal';
import classes from './WordsList.module.css';

type SortField = 'word' | 'createdAt' | 'editedAt';
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

export function WordsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const createButtonRef = useRef<HTMLAnchorElement | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    opened: boolean;
    wordId: string;
    wordText: string;
  }>({ opened: false, wordId: '', wordText: '' });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortField = (searchParams.get('sortField') as SortField) || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';

  const pageSize = 10;

  const {
    data: wordsData,
    isFetching,
    error,
    refetch,
  } = useWords({
    page: currentPage,
    pageSize,
    sortingFieldName: sortField,
    sortingOrder: sortOrder,
    searchQuery: debouncedSearchQuery || undefined,
  });

  const deleteWordMutation = useDeleteWord();

  const handleSort = (field: SortField) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (field === sortField) {
        newParams.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        newParams.set('sortField', field);
        newParams.set('sortOrder', 'asc');
      }
      newParams.set('page', '1');
      return newParams;
    });
  };

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
        <ActionIcon variant="light" color="blue" size="lg" aria-label={`Actions for ${word.word}`}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Word Management</Menu.Label>
        <Menu.Item
          leftSection={<IconEdit size={16} />}
          component={Link}
          to={`/words/${word.wordId}/edit?returnPage=${currentPage}`}>
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

  const MobileWordCard = ({ word }: { word: WordRecordDto }) => (
    <Paper p="md" withBorder mb="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
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
            {word.editedAt && (
              <Text fz="xs" c="dimmed">
                Edited: {formatDateTime(word.editedAt)}
              </Text>
            )}
          </div>
          <WordActionMenu word={word} />
        </Group>
      </Stack>
    </Paper>
  );

  const rows = words.map((word) => (
    <Table.Tr key={word.wordId}>
      <Table.Td>
        <Text>{word.word}</Text>
      </Table.Td>
      <Table.Td className={classes.wordTypeCol}>
        <Badge size="sm" variant="light">
          {word.wordType}
        </Badge>
      </Table.Td>
      <Table.Td className={classes.createdCol}>
        <Text>{formatDateTime(word.createdAt)}</Text>
      </Table.Td>
      <Table.Td className={classes.editedCol}>
        <Text>{word.editedAt ? formatDateTime(word.editedAt) : '-'}</Text>
      </Table.Td>
      <Table.Td className={classes.actionCol}>
        <Group justify="center">
          <WordActionMenu word={word} />
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

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
          <ActionIcon component={Link} to={links.newWord.url} size="xl" hiddenFrom="md">
            <IconPlus size={22} />
          </ActionIcon>
          <Button
            ref={createButtonRef}
            leftSection={<IconPlus size={16} />}
            component={Link}
            to={`${links.newWord.url}?returnPage=${currentPage}`}
            size="md"
            visibleFrom="sm">
            <Text>Create New Word</Text>
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
              words.map((word) => <MobileWordCard key={word.wordId} word={word} />)
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                {debouncedSearchQuery
                  ? 'No words found matching your search.'
                  : 'No words created yet. Create your first word to get started!'}
              </Text>
            )}
          </Box>

          <ScrollArea visibleFrom="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
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
                  <Table.Th>
                    <SortableHeader
                      label="Created"
                      field="createdAt"
                      currentField={sortField}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader
                      label="Edited"
                      field="editedAt"
                      currentField={sortField}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
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
          </ScrollArea>
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
