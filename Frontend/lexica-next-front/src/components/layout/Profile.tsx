import { useId, useRef } from 'react';
import { IconUser } from '@tabler/icons-react';
import { Avatar, Box, Popover, UnstyledButton } from '@mantine/core';
import { ProfileDetails } from './ProfileDetails';
import classes from './Profile.module.css';

interface ProfileProps {
  email: string;
  version: string;
  opened: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Profile({ email, version, opened, onToggle, onClose }: ProfileProps) {
  const titleId = useId();

  const closeDetails = () => {
    onClose();
  };

  const accountButton = (
    <UnstyledButton
      // ref={triggerRef}
      className={classes.accountButton}
      aria-label="Open account details"
      onClick={onToggle}
      onKeyDown={(event) => {
        if (opened && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeDetails();
        }
      }}>
      <Avatar color="blue" variant={opened ? 'filled' : 'light'} radius="xl" size={34}>
        <IconUser size={18} aria-hidden />
      </Avatar>
    </UnstyledButton>
  );

  return (
    <Box className={classes.headerControl}>
      <Popover
        opened={opened}
        onDismiss={closeDetails}
        position="bottom-end"
        width="300px"
        offset={16}
        middlewares={{ shift: { padding: 16 }, flip: { padding: 16 } }}
        shadow="md"
        radius="md"
        trapFocus>
        <Popover.Target>{accountButton}</Popover.Target>
        <Popover.Dropdown p={0} className={classes.popover} aria-labelledby={titleId}>
          <ProfileDetails email={email} version={version} headingId={titleId} />
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
