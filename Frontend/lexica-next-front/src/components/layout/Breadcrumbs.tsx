import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { api } from '../../services/api';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  '': 'Home',
  'sign-in': 'Sign In',
  sets: 'Sets',
  new: 'New Set',
  edit: 'Edit Set',
  content: 'Content',
  'spelling-mode': 'Spelling Mode',
  'full-mode': 'Full Mode',
  'only-open-questions-mode': 'Open Questions Mode',
};

export function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [setName, setSetName] = useState<string>('');

  // Fetch set name if we have a setId
  useEffect(() => {
    const fetchSetName = async () => {
      if (!params.setId) {
        return;
      }

      try {
        const response = await api.getSet(params.setId);
        setSetName(response.name);
      } catch (error) {
        console.error('Failed to fetch set name:', error);
        setSetName(params.setId);
      }
    };

    fetchSetName();
  }, [params.setId]);

  const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Home', href: '/' }];
  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    let title: string;
    let href: string | undefined;

    if (segment.match(/^\d+$/) || segment === params.setId) {
      title = setName || 'Loading...';
    } else {
      title = routeMap[segment] || segment;
      href = currentPath;
    }

    const isLast = i === pathSegments.length - 1;
    if (isLast || (segment === params.setId && i < pathSegments.length - 1)) {
      href = undefined;
    }

    breadcrumbItems.push({ title, href });
  }

  const items = breadcrumbItems.map((item, index) => {
    if (item.href) {
      return (
        <Anchor key={index} component={Link} to={item.href} size="sm" fw={500}>
          {item.title}
        </Anchor>
      );
    }

    return (
      <Text key={index} size="sm" c="dimmed" fw={500}>
        {item.title}
      </Text>
    );
  });

  return (
    <MantineBreadcrumbs separator="/" mb="sm" mt={0}>
      {items}
    </MantineBreadcrumbs>
  );
}
