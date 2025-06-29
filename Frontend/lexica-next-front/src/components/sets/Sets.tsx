import { useState } from 'react';
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
import { Link } from 'react-router';
import {
  ActionIcon,
  Box,
  Button,
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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { links } from '../../config/links';
import { useDeleteSet, useSets, type SetRecordDto } from '../../hooks/api';
import { formatDateTime } from '../../utils/date';

export function Sets() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const sortingFieldName = 'createdAt';
  const sortingOrder = 'desc';
  const pageSize = 10;

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
    searchQuery: searchQuery || undefined,
  });

  const deleteSetMutation = useDeleteSet();

  const sets = setsData?.data || [];
  const totalCount = setsData?.count || 0;

  if (error) {
    notifications.show({
      title: 'Error',
      message: 'Failed to load sets',
      color: 'red',
    });
  }

  const handleDelete = (setId: string, setName: string) => {
    modals.openConfirmModal({
      title: 'Delete Set',
      children: <Text>Are you sure you want to delete "{setName}"? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteSetMutation.mutate(
          {
            params: { path: { setId } },
          },
          {
            onSuccess: () => {
              notifications.show({
                title: 'Success',
                message: 'Set deleted successfully',
                color: 'green',
              });
              refetch();
            },
            onError: () => {
              notifications.show({
                title: 'Error',
                message: 'Failed to delete set',
                color: 'red',
              });
            },
          },
        );
      },
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const SetActionMenu = ({ set }: { set: SetRecordDto }) => (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="light" color="blue" size="lg" aria-label={`Actions for ${set.name}`}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Learning Modes</Menu.Label>
        <Menu.Item leftSection={<IconHeadphones size={16} />} component={Link} to={`/sets/${set.setId}/spelling-mode`}>
          Spelling Mode
        </Menu.Item>
        <Menu.Item leftSection={<IconBrain size={16} />} component={Link} to={`/sets/${set.setId}/full-mode`}>
          Full Mode
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTarget size={16} />}
          component={Link}
          to={`/sets/${set.setId}/only-open-questions-mode`}>
          Open Questions Mode
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Set Management</Menu.Label>
        <Menu.Item leftSection={<IconEye size={16} />} component={Link} to={`/sets/${set.setId}/content`}>
          View Content
        </Menu.Item>
        <Menu.Item leftSection={<IconEdit size={16} />} component={Link} to={`/sets/${set.setId}/edit`}>
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

  const MobileSetCard = ({ set }: { set: SetRecordDto }) => (
    <Paper p="md" withBorder mb="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} fz="md" truncate>
              {set.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {formatDateTime(set.createdAt)}
            </Text>
          </div>
          <SetActionMenu set={set} />
        </Group>
      </Stack>
    </Paper>
  );

  const rows = sets.map((set) => (
    <Table.Tr key={set.setId}>
      <Table.Td>
        <div>
          <Text>{set.name}</Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Text>{formatDateTime(set.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Group justify="center">
          <SetActionMenu set={set} />
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="md">
        <Group wrap="wrap" gap="sm">
          <ActionIcon component={Link} to={links.newSet.url} size="xl" hiddenFrom="md">
            <IconPlus size={22} />
          </ActionIcon>
          <Button
            leftSection={<IconPlus size={16} />}
            component={Link}
            to={links.newSet.url}
            size="md"
            visibleFrom="sm">
            <Text>Create New Set</Text>
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

        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={isFetching} />

          <Box hiddenFrom="md">
            {sets.length > 0 ? (
              sets.map((set) => <MobileSetCard key={set.setId} set={set} />)
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                {searchQuery
                  ? 'No sets found matching your search.'
                  : 'No sets created yet. Create your first set to get started!'}
              </Text>
            )}
          </Box>

          <ScrollArea visibleFrom="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Text ta="center" c="dimmed" py="xl">
                        {searchQuery
                          ? 'No sets found matching your search.'
                          : 'No sets created yet. Create your first set to get started!'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>

        <Group justify="center" mt="md">
          <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="md" />
        </Group>
      </Stack>
    </>
  );
}
