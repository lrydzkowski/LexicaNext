import { useAuth0 } from '@auth0/auth0-react';
import { IconLogout } from '@tabler/icons-react';
import { NavLink } from 'react-router';
import { Box, Burger, Button, Container, Divider, Drawer, Group, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';

const items = [
  { label: 'Sets', href: '/sets' },
  { label: 'About', href: '/about' },
];

const publicItems = [{ label: 'Sign In', href: '/sign-in' }];

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const { isAuthenticated, logout } = useAuth0();

  const appTitle = 'LexicaNext';

  const navItems = isAuthenticated ? items : publicItems;

  const navigationLinks = navItems.map((item) => (
    <NavLink
      key={`${item.href}-desktop`}
      to={item.href}
      className={({ isActive }) => `${classes.link} ${isActive ? classes.active : ''}`}>
      {item.label}
    </NavLink>
  ));

  const mobileNavigationLinks = navItems.map((item) => (
    <NavLink
      key={`${item.href}-mobile`}
      to={item.href}
      className={({ isActive }) => `${classes.link} ${isActive ? classes.active : ''}`}
      onClick={closeDrawer}>
      {item.label}
    </NavLink>
  ));

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Box>
      <header className={classes.header}>
        <Group h="100%">
          <Group>
            <Title order={1} size="h2" fw={700} c="blue">
              {appTitle}
            </Title>
          </Group>

          <Group h="100%" gap={0} visibleFrom="sm" justify="space-between" style={{ flex: 1 }}>
            <Group h="100%" gap={0}>
              {navigationLinks}
            </Group>
            {isAuthenticated && (
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Group>

          <Burger className={classes.burgerButton} opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding={0}
        className={classes.drawer}
        hiddenFrom="sm"
        zIndex={1000000}>
        <Stack gap="0">
          <Divider mb="sm" />
          {mobileNavigationLinks}
          {isAuthenticated && (
            <>
              <Divider my="sm" />
              <Container fluid>
                <Button
                  color="red"
                  variant="light"
                  size="md"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {
                    handleLogout();
                    closeDrawer();
                  }}
                  mx="md">
                  Logout
                </Button>
              </Container>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
