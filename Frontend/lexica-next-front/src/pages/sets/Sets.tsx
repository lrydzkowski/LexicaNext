import { useEffect, useState } from 'react';
import {
  IconBrain,
  IconDots,
  IconEdit,
  IconEye,
  IconHeadphones,
  IconPlus,
  IconSearch,
  IconTarget,
  IconTrash,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { api, type SetRecordDto } from '../../services/api';

export function Sets() {
  const [sets, setSets] = useState<SetRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const pageSize = 10;

  const fetchSets = async () => {
    try {
      setLoading(true);
      const response = await api.getSets({
        page: currentPage,
        pageSize,
        sortingFieldName: sortField,
        sortingOrder: sortOrder,
        searchQuery: searchQuery || undefined,
      });
      setSets(response.data);
      setTotalCount(response.count);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load sets',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [currentPage, sortField, sortOrder, searchQuery]);

  const handleDelete = async (setId: string, setName: string) => {
    modals.openConfirmModal({
      title: 'Delete Set',
      children: <Text>Are you sure you want to delete "{setName}"? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.deleteSet(setId);
          notifications.show({
            title: 'Success',
            message: 'Set deleted successfully',
            color: 'green',
          });
          fetchSets();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete set',
            color: 'red',
          });
        }
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
        <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => handleDelete(set.setId, set.name)}>
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
              {new Date(set.createdAt).toLocaleDateString()}
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
          <Text fw={500}>{set.name}</Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" c="dimmed">
          {new Date(set.createdAt).toLocaleDateString()}
        </Text>
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
      <Container p={0}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Title order={2} mb="sm" mt="sm">
              My Vocabulary Sets
            </Title>
            <Button leftSection={<IconPlus size={16} />} component={Link} to="/sets/new" size="md">
              <Text visibleFrom="sm">Create New Set</Text>
              <Text hiddenFrom="sm">Create</Text>
            </Button>
          </Group>

          <Paper>
            <Stack gap="md">
              <Group wrap="wrap">
                <TextInput
                  placeholder="Search sets..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                  size="md"
                />
                <Select
                  placeholder="Sort by"
                  value={sortField}
                  onChange={(value) => setSortField(value || 'name')}
                  data={[
                    { value: 'name', label: 'Name' },
                    { value: 'createdAt', label: 'Created Date' },
                  ]}
                  size="md"
                />
                <Select
                  placeholder="Order"
                  value={sortOrder}
                  onChange={(value) => setSortOrder((value as 'asc' | 'desc') || 'asc')}
                  data={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                  ]}
                  size="md"
                />
              </Group>

              <Box style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} />

                {/* Mobile view */}
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

                {/* Desktop view */}
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

              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="md" />
                </Group>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
