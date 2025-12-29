import { type ReactNode } from 'react';
import { Link, useMatches } from 'react-router';
import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { type BreadcrumbHandle, type BreadcrumbItem } from '../../AppRouter';
import { DynamicBreadcrumbLabel } from './DynamicBreadcrumbLabel';
import classes from './Breadcrumbs.module.css';

function renderLabel(crumb: BreadcrumbItem): ReactNode {
  if (crumb.resolver) {
    return <DynamicBreadcrumbLabel resolver={crumb.resolver} />;
  }

  return crumb.label;
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => {
      const handle = match.handle as BreadcrumbHandle | undefined;

      return handle?.breadcrumb;
    })
    .flatMap((match) => {
      const handle = match.handle as BreadcrumbHandle;

      return handle.breadcrumb(match.params).map((crumb, index) => {
        return {
          id: `${match.id}-${index}`,
          ...crumb,
        };
      });
    });

  const items = crumbs.map((crumb, index) => {
    const isLast = index === crumbs.length - 1;

    if (isLast || !crumb.link) {
      return (
        <Text key={crumb.id} size="sm" c="dimmed" fw={500}>
          {renderLabel(crumb)}
        </Text>
      );
    }

    return (
      <Anchor key={crumb.id} component={Link} to={crumb.link} size="sm" fw={500}>
        {renderLabel(crumb)}
      </Anchor>
    );
  });

  return (
    <MantineBreadcrumbs separator="/" mb="sm" mt={0} className={classes.breadcrumbs}>
      {items}
    </MantineBreadcrumbs>
  );
}
