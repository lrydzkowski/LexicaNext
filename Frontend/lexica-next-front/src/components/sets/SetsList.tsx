import { useEffect, useRef, useState } from 'react';
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
import { Link, useSearchParams } from 'react-router';
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
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { links } from '../../config/links';
import { useDeleteSet, useDeleteSets, useSets, type SetRecordDto } from '../../hooks/api';
import { formatDateTime } from '../../utils/date';

export function SetsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 150);
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());
  const createButtonRef = useRef<HTMLAnchorElement | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const sortingFieldName = 'createdAt';
  const sortingOrder = 'desc';

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
  });

  const deleteSetMutation = useDeleteSet();
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
      notifications.show({
        title: 'Error Loading Sets',
        message: 'An unexpected error occurred',
        color: 'red',
        position: 'top-center',
      });
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

  const handleBulkDelete = () => {
    const count = selectedSetIds.size;
    modals.openConfirmModal({
      title: 'Delete Sets',
      children: (
        <Text>
          Are you sure you want to delete {count} set{count > 1 ? 's' : ''}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const idsToDelete = Array.from(selectedSetIds);
        deleteSetsMutation.mutate(idsToDelete, {
          onSuccess: (failedCount) => {
            setSelectedSetIds(new Set());
            if (failedCount > 0) {
              notifications.show({
                title: 'Partial Failure',
                message: `Failed to delete ${failedCount} set${failedCount > 1 ? 's' : ''}`,
                color: 'red',
                position: 'top-center',
              });
            }
          },
          onError: () => {
            notifications.show({
              title: 'Error',
              message: 'Failed to delete sets',
              color: 'red',
              position: 'top-center',
            });
          },
        });
      },
    });
  };

  const handleDelete = (setId: string, setName: string) => {
    modals.openConfirmModal({
      title: 'Delete Set',
      children: (
        <Text style={{ wordWrap: 'break-word' }}>
          Are you sure you want to delete "{setName}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteSetMutation.mutate(setId, {
          onSuccess: () => {
            refetch();
          },
          onError: () => {
            notifications.show({
              title: 'Error Deleting Set',
              message: 'Failed to delete set',
              color: 'red',
              position: 'top-center',
            });
          },
        });
      },
    });
  };

  const totalPages = Math.ceil((totalCount as number) / pageSize);

  const SetActionMenu = ({ set }: { set: SetRecordDto }) => (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="light"
          color="blue"
          size="lg"
          aria-label={`Actions for ${set.name}`}
          onClick={(e) => e.stopPropagation()}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
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
          onClick={() => handleDelete(set.setId || '', set.name || '')}>
          Delete Set
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
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
            onClick={handleBulkDelete}
            hiddenFrom="md">
            <IconTrash size={22} />
          </ActionIcon>
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            size="md"
            disabled={selectedSetIds.size === 0}
            onClick={handleBulkDelete}
            visibleFrom="md">
            Delete{selectedSetIds.size > 0 ? ` (${selectedSetIds.size})` : ''}
          </Button>
          <ActionIcon variant="light" size="xl" onClick={() => refetch()}>
            <IconRefresh size={22} />
          </ActionIcon>
          <TextInput
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
              sets.map((set) => (
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
                        <SetActionMenu set={set} />
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
                sets.map((set) => (
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
                        <SetActionMenu set={set} />
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
