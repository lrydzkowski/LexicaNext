import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconBrain,
  IconDots,
  IconEdit,
  IconEye,
  IconHeadphones,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTarget,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  ActionIcon,
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
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { links } from '../../config/links';
import { SHORTCUT_KEYS } from '../../config/shortcuts';
import { useDeleteSets, useSets, type SetRecordDto } from '../../hooks/api';
import { generateRowHandlers, useShortcuts } from '../../hooks/useShortcuts';
import { showErrorNotification } from '../../services/error-notifications';
import { formatDateTime } from '../../utils/date';
import { DeleteSetModal } from './DeleteSetModal';

export function SetsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());
  const createButtonRef = useRef<HTMLAnchorElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileActionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const desktopActionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    opened: boolean;
    sets: { setId: string; setName: string }[];
  }>({ opened: false, sets: [] });

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const sortingFieldName = 'createdAt';
  const sortingOrder = 'desc';

  const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    data: setsData,
    isFetching,
    error,
    refetch,
  } = useSets({
    page: currentPage,
    pageSize,
    sortingFieldName,
    sortingOrder,
    searchQuery: debouncedSearchQuery || undefined,
    timeZoneId,
  });

  const deleteSetsMutation = useDeleteSets();

  const sets = setsData?.data || [];
  const totalCount = setsData?.count || 0;

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
      showErrorNotification('Error Loading Sets', error);
    }
  }, [error]);

  useEffect(() => {
    setSelectedSetIds(new Set());
  }, [currentPage, debouncedSearchQuery]);

  const toggleSetSelection = (setId: string) => {
    if (!setId) {
      return;
    }

    setSelectedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  };

  const toggleAllSets = () => {
    if (selectedSetIds.size === sets.length) {
      setSelectedSetIds(new Set());
    } else {
      setSelectedSetIds(new Set(sets.map((s) => s.setId || '')));
    }
  };

  const openDeleteModal = (setId: string, setName: string) => {
    setDeleteModalState({ opened: true, sets: [{ setId, setName }] });
  };

  const openBulkDeleteModal = () => {
    const setsToDelete = sets
      .filter((s) => selectedSetIds.has(s.setId || ''))
      .map((s) => ({ setId: s.setId || '', setName: s.name || '' }));
    setDeleteModalState({ opened: true, sets: setsToDelete });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ opened: false, sets: [] });
  };

  const handleDelete = () => {
    if (!deleteModalState.opened || deleteModalState.sets.length === 0) {
      return;
    }

    const setIds = deleteModalState.sets.map((s) => s.setId);

    deleteSetsMutation.mutate(setIds, {
      onSuccess: () => {
        closeDeleteModal();
        setSelectedSetIds(new Set());
      },
      onError: (error) => {
        showErrorNotification('Error Deleting Sets', error);
      },
    });
  };

  const totalPages = Math.ceil((totalCount as number) / pageSize);

  const shortcutHandlers = useMemo(
    () => [
      {
        key: SHORTCUT_KEYS.CREATE_NEW,
        handler: () => navigate(links.newSet.getUrl({}, { returnPage: currentPage.toString() })),
      },
      {
        key: SHORTCUT_KEYS.FOCUS_SEARCH,
        handler: () => searchInputRef.current?.focus(),
      },
      ...generateRowHandlers((index) => {
        const refs = isDesktop ? desktopActionButtonRefs : mobileActionButtonRefs;
        refs.current[index]?.focus();
      }),
    ],
    [navigate, currentPage, isDesktop],
  );

  useShortcuts('sets-list', shortcutHandlers);

  const SetActionMenu = ({
    set,
    index,
    refsArray,
  }: {
    set: SetRecordDto;
    index: number;
    refsArray: React.RefObject<(HTMLButtonElement | null)[]>;
  }) => (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          ref={(el) => {
            refsArray.current[index] = el;
          }}
          variant="light"
          color="blue"
          size="lg"
          aria-label={`Actions for ${set.name}`}
          onClick={(e) => e.stopPropagation()}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        <Menu.Label>Learning Modes</Menu.Label>
        <Menu.Item
          leftSection={<IconHeadphones size={16} />}
          component={Link}
          to={links.spellingMode.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })}>
          Spelling Mode
        </Menu.Item>
        <Menu.Item
          leftSection={<IconBrain size={16} />}
          component={Link}
          to={links.fullMode.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })}>
          Full Mode
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTarget size={16} />}
          component={Link}
          to={links.openQuestionsMode.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })}>
          Open Questions Mode
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Set Management</Menu.Label>
        <Menu.Item
          leftSection={<IconEye size={16} />}
          component={Link}
          to={links.setContent.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })}>
          View Content
        </Menu.Item>
        <Menu.Item
          leftSection={<IconEdit size={16} />}
          component={Link}
          to={links.editSet.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })}>
          Edit Set
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTrash size={16} />}
          color="red"
          onClick={() => openDeleteModal(set.setId || '', set.name || '')}>
          Delete Set
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <DeleteSetModal
        opened={deleteModalState.opened}
        onClose={closeDeleteModal}
        sets={deleteModalState.sets}
        onConfirm={handleDelete}
        isDeleting={deleteSetsMutation.isPending}
      />

      <Stack gap="md">
        <Group wrap="wrap" gap="sm">
          <ActionIcon component={Link} to={links.newSet.getUrl()} size="xl" hiddenFrom="md">
            <IconPlus size={22} />
          </ActionIcon>
          <Button
            ref={createButtonRef}
            leftSection={<IconPlus size={16} />}
            component={Link}
            to={links.newSet.getUrl({}, { returnPage: currentPage.toString() })}
            size="md"
            visibleFrom="md">
            <Text>Create New Set</Text>
          </Button>
          <ActionIcon
            color="red"
            size="xl"
            disabled={selectedSetIds.size === 0}
            loading={deleteSetsMutation.isPending}
            onClick={openBulkDeleteModal}
            hiddenFrom="md">
            <IconTrash size={22} />
          </ActionIcon>
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            size="md"
            disabled={selectedSetIds.size === 0}
            loading={deleteSetsMutation.isPending}
            onClick={openBulkDeleteModal}
            visibleFrom="md">
            Delete{selectedSetIds.size > 0 ? ` (${selectedSetIds.size})` : ''}
          </Button>
          <ActionIcon variant="light" size="xl" onClick={() => refetch()}>
            <IconRefresh size={22} />
          </ActionIcon>
          <TextInput
            ref={searchInputRef}
            placeholder="Search sets..."
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
            {sets.length > 0 ? (
              sets.map((set, index) => (
                <Paper
                  key={set.setId}
                  p="md"
                  withBorder
                  mb="sm"
                  onClick={() => toggleSetSelection(set.setId || '')}
                  style={{ cursor: 'pointer' }}>
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Checkbox
                        checked={selectedSetIds.has(set.setId || '')}
                        onChange={() => toggleSetSelection(set.setId || '')}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${set.name}`}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} fz="md" truncate>
                          {set.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {formatDateTime(set.createdAt)}
                        </Text>
                      </div>
                      <Box>
                        <SetActionMenu set={set} index={index} refsArray={mobileActionButtonRefs} />
                      </Box>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                {debouncedSearchQuery
                  ? 'No sets found matching your search.'
                  : 'No sets created yet. Create your first set to get started!'}
              </Text>
            )}
          </Box>

          <Table striped highlightOnHover style={{ tableLayout: 'fixed' }} visibleFrom="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    checked={sets.length > 0 && selectedSetIds.size === sets.length}
                    indeterminate={selectedSetIds.size > 0 && selectedSetIds.size < sets.length}
                    onChange={toggleAllSets}
                    aria-label="Select all sets"
                  />
                </Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th w={180}>Created</Table.Th>
                <Table.Th w={80} style={{ textAlign: 'center' }}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sets.length > 0 ? (
                sets.map((set, index) => (
                  <Table.Tr
                    key={set.setId}
                    onClick={() => toggleSetSelection(set.setId || '')}
                    style={{ cursor: 'pointer' }}>
                    <Table.Td w={40} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSetIds.has(set.setId || '')}
                        onChange={() => toggleSetSelection(set.setId || '')}
                        aria-label={`Select ${set.name}`}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text truncate="end">{set.name}</Text>
                    </Table.Td>
                    <Table.Td w={180}>
                      <Text>{formatDateTime(set.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td w={80}>
                      <Group justify="center">
                        <SetActionMenu set={set} index={index} refsArray={desktopActionButtonRefs} />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed" py="xl">
                      {debouncedSearchQuery
                        ? 'No sets found matching your search.'
                        : 'No sets created yet. Create your first set to get started!'}
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
