import { NavLink } from 'react-router';
import { Box, Burger, Divider, Drawer, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';

const items = [
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Home', href: '/' },
  { label: 'Sets', href: '/sets' },
];

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const appTitle = 'LexicaNext';
  const navigationLinks = items.map((item) => (
    <NavLink
      key={item.href + '-desktop'}
      to={item.href}
      className={({ isActive }) => `${classes.link} ${isActive ? classes.active : ''}`}>
      {item.label}
    </NavLink>
  ));
  const mobileNavigationLinks = items.map((item) => (
    <NavLink
      key={item.href + '-mobile'}
      to={item.href}
      className={({ isActive }) => `${classes.link} ${isActive ? classes.active : ''}`}
      onClick={closeDrawer}>
      {item.label}
    </NavLink>
  ));

  return (
    <Box>
      <header className={classes.header}>
        <Group h="100%">
          <Group>
            <Title order={1} size="h2" fw={700} c="blue">
              {appTitle}
            </Title>
          </Group>

          <Group h="100%" gap={0} visibleFrom="sm">
            {navigationLinks}
          </Group>

          <Burger className={classes.burgerButton} opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>{' '}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding={0}
        className={classes.drawer}
        title={
          <Title px="md" order={1} size="h2" fw={700} c="blue">
            {appTitle}
          </Title>
        }
        hiddenFrom="sm"
        zIndex={1000000}>
        <Divider mb="sm" />
        {mobileNavigationLinks}
      </Drawer>
    </Box>
  );
}
