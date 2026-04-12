import { useNavigate } from 'react-router';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { clearSession, getModeLabel, getModeUrl, type SessionSummary } from '../../services/session-storage';

interface SessionResumeModalProps {
  opened: boolean;
  session: SessionSummary | null;
  onClose: () => void;
}

export function SessionResumeModal({ opened, session, onClose }: SessionResumeModalProps) {
  const navigate = useNavigate();

  if (!session) {
    return null;
  }

  const handleContinue = () => {
    onClose();
    navigate(getModeUrl(session.setId, session.mode));
  };

  const handleStartFresh = () => {
    clearSession(session.setId, session.mode);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Continue Learning?" closeOnClickOutside closeOnEscape zIndex={400}>
      <Stack gap="md">
        <Text>You have an unfinished learning session:</Text>
        <Stack gap="xs">
          <Text size="sm">
            <Text span fw={600}>
              Set:
            </Text>{' '}
            {session.setName}
          </Text>
          <Text size="sm">
            <Text span fw={600}>
              Mode:
            </Text>{' '}
            {getModeLabel(session.mode)}
          </Text>
        </Stack>
        <Text size="sm" c="dimmed">
          Would you like to continue where you left off or start fresh?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleStartFresh} data-autofocus>
            Start Fresh
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
