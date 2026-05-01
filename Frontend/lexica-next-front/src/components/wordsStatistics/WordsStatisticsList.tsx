import { useEffect, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconRefresh,
  IconSearch,
  IconSelector,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { Link, useLocation, useSearchParams } from 'react-router';
import {
  ActionIcon,
  Box,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { links } from '../../config/links';
import { useFocusClaim } from '../../contexts/FocusClaimContext';
import { useWordsStatistics } from '../../hooks/api';
import { showErrorNotification } from '../../services/error-notifications';

type SortField = 'correctCount' | 'incorrectCount' | 'word';
type SortOrder = 'asc' | 'desc';

const DEFAULT_SORT_FIELD: SortField = 'incorrectCount';
const DEFAULT_SORT_ORDER: SortOrder = 'desc';
const PAGE_SIZE = 10;

const parseSortField = (value: string | null): SortField => {
  if (value === 'correctCount' || value === 'incorrectCount' || value === 'word') {
    return value;
  }

  return DEFAULT_SORT_FIELD;
};

const parseSortOrder = (value: string | null): SortOrder => {
  if (value === 'asc' || value === 'desc') {
    return value;
  }

  return DEFAULT_SORT_ORDER;
};

export function WordsStatisticsList() {
  const location = useLocation();
  const focusClaimed = useFocusClaim();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const parsedPage = parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const sortingFieldName = parseSortField(searchParams.get('sortingFieldName'));
  const sortingOrder = parseSortOrder(searchParams.get('sortingOrder'));
  const urlSearchQuery = searchParams.get('searchQuery') || '';

  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    if (focusClaimed) {
      return;
    }

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery === urlSearchQuery) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearchQuery) {
          next.set('searchQuery', debouncedSearchQuery);
        } else {
          next.delete('searchQuery');
        }

        next.delete('page');

        return next;
      },
      { replace: true },
    );
  }, [debouncedSearchQuery, urlSearchQuery, setSearchParams]);

  const { data, isLoading, error, refetch } = useWordsStatistics({
    page: currentPage,
    pageSize: PAGE_SIZE,
    sortingFieldName,
    sortingOrder,
    searchQuery: debouncedSearchQuery || undefined,
  });

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Words Statistics', error);
    }
  }, [error]);

  const rows = data?.data || [];
  const totalCount = Number(data?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const toggleSort = (field: SortField) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const currentField = parseSortField(next.get('sortingFieldName'));
        const currentOrder = parseSortOrder(next.get('sortingOrder'));
        let nextOrder: SortOrder = 'desc';
        if (currentField === field) {
          nextOrder = currentOrder === 'desc' ? 'asc' : 'desc';
        }

        next.set('sortingFieldName', field);
        next.set('sortingOrder', nextOrder);
        next.delete('page');

        return next;
      },
      { replace: true },
    );
  };

  const setPage = (page: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', page.toString());

        return next;
      },
      { replace: true },
    );
  };

  const renderSortIcon = (field: SortField) => {
    if (sortingFieldName !== field) {
      return <IconSelector size={14} />;
    }

    return sortingOrder === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />;
  };

  const emptyMessage =
    totalCount === 0
      ? debouncedSearchQuery
        ? 'No words match your filter.'
        : 'No open-questions answers recorded yet. Practice some words to see statistics here.'
      : null;

  const currentUrl = `/words-statistics${location.search}`;

  return (
    <Stack gap="md">
      <Group wrap="wrap" gap="sm">
        <ActionIcon variant="light" size="xl" onClick={() => refetch()} aria-label="Refresh">
          <IconRefresh size={22} />
        </ActionIcon>
        <TextInput
          ref={searchInputRef}
          placeholder="Filter words..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '100px' }}
          size="md"
        />
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={isLoading} />

        <Box hiddenFrom="md">
          {rows.length > 0
            ? rows.map((row) => (
                <Paper p="md" withBorder mb="sm" key={row.wordId}>
                  <Group justify="space-between" align="center">
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={600} truncate>
                        {row.word}
                      </Text>
                      <Group gap="md">
                        <Text fz="sm" c="green">
                          Correct: {row.correctCount}
                        </Text>
                        <Text fz="sm" c="red">
                          Incorrect: {row.incorrectCount}
                        </Text>
                      </Group>
                    </Stack>
                    <ActionIcon
                      component={Link}
                      to={links.editWord.getUrl({ wordId: row.wordId }, { returnTo: currentUrl })}
                      variant="light"
                      size="lg"
                      aria-label={`Edit ${row.word}`}>
                      <IconArrowRight size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))
            : !isLoading && (
                <Text ta="center" c="dimmed" py="xl">
                  {emptyMessage}
                </Text>
              )}
        </Box>

        <Table striped highlightOnHover style={{ tableLayout: 'fixed' }} visibleFrom="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <UnstyledButton onClick={() => toggleSort('word')}>
                  <Group gap={4}>
                    <Text fw={600} fz="sm">
                      Word
                    </Text>
                    {renderSortIcon('word')}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th w={140}>
                <UnstyledButton onClick={() => toggleSort('correctCount')}>
                  <Group gap={4}>
                    <Text fw={600} fz="sm">
                      Correct
                    </Text>
                    {renderSortIcon('correctCount')}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th w={140}>
                <UnstyledButton onClick={() => toggleSort('incorrectCount')}>
                  <Group gap={4}>
                    <Text fw={600} fz="sm">
                      Incorrect
                    </Text>
                    {renderSortIcon('incorrectCount')}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th w={80} style={{ textAlign: 'center' }}>
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0
              ? rows.map((row) => (
                  <Table.Tr key={row.wordId}>
                    <Table.Td>
                      <Text truncate="end">{row.word}</Text>
                    </Table.Td>
                    <Table.Td w={140}>
                      <Text c="green">{row.correctCount}</Text>
                    </Table.Td>
                    <Table.Td w={140}>
                      <Text c="red">{row.incorrectCount}</Text>
                    </Table.Td>
                    <Table.Td w={80}>
                      <Group justify="center">
                        <ActionIcon
                          component={Link}
                          to={links.editWord.getUrl({ wordId: row.wordId }, { returnTo: currentUrl })}
                          variant="light"
                          size="lg"
                          aria-label={`Edit ${row.word}`}>
                          <IconArrowRight size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              : !isLoading && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed" py="xl">
                        {emptyMessage}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="center" mt="md">
        <Pagination total={totalPages} value={currentPage} onChange={setPage} size="md" />
      </Group>
    </Stack>
  );
}
