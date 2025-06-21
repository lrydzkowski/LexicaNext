import { NavLink } from 'react-router';
import { Box, Burger, Divider, Drawer, Group, ScrollArea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';

const items = [
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Home', href: '/' },
  { label: 'Sets', href: '/sets' },
  { label: 'New Set', href: '/sets/new' },
];

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const appTitle = 'Lexica Next';

  const navigationLinks = items.map((item) => (
    <NavLink key={item.href + '-desktop'} to={item.href} className={classes.link}>
      {item.label}
    </NavLink>
  ));

  const mobileNavigationLinks = items.map((item) => (
    <NavLink key={item.href + '-mobile'} to={item.href} className={classes.link}>
      {item.label}
    </NavLink>
  ));

  return (
    <Box>
      <header className={classes.header}>
        <Group h="100%">
          <Group>
            <Text size="xl" fw={700} c="blue">
              {appTitle}
            </Text>
          </Group>

          <Group h="100%" gap={0} visibleFrom="sm">
            {navigationLinks}
          </Group>

          <Burger className={classes.burgerButton} opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={appTitle}
        hiddenFrom="sm"
        zIndex={1000000}>
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider mb="sm" />

          {mobileNavigationLinks}
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
