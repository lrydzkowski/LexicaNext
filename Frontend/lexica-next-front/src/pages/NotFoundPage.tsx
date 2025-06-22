import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container p={0}>
      <Stack gap="xl" align="center" py="xl">
        <Stack gap="md" align="center">
          <Title order={1} size="h1" fw={700} c="red">
            404
          </Title>
          <Title order={2} size="h3" ta="center">
            Page Not Found
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={500}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track with your
            vocabulary learning!
          </Text>
        </Stack>

        <Group gap="md" wrap="wrap" justify="center">
          <Button leftSection={<IconHome size={16} />} onClick={() => navigate('/')} size="md">
            Go Home
          </Button>
          <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)} size="md">
            Go Back
          </Button>
        </Group>

        <Text size="sm" c="dimmed" ta="center">
          Need help? Check out your vocabulary sets or create a new one to continue learning.
        </Text>
      </Stack>
    </Container>
  );
}
