import { Divider, Group, Stack, Text } from '@mantine/core';
import classes from './Profile.module.css';

interface ProfileDetailsProps {
  email: string;
  version: string;
  headingId?: string;
}

export function ProfileDetails({ email, version, headingId }: ProfileDetailsProps) {
  return (
    <>
      <Stack p="lg" gap="xs">
        <Text id={headingId} size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.6}>
          Your account
        </Text>
        <Text fw={600} className={classes.email}>
          {email}
        </Text>
      </Stack>
      <Divider />
      <Group justify="space-between" px="lg" py="sm" className={classes.buildRow}>
        <Text size="xs" c="dimmed">
          Build version
        </Text>
        <Text size="xs" ff="monospace">
          {version}
        </Text>
      </Group>
    </>
  );
}
