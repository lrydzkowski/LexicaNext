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
      if (params.setId) {
        try {
          const response = await api.getSet(params.setId);
          setSetName(response.name);
        } catch (error) {
          console.error('Failed to fetch set name:', error);
          setSetName('Unknown Set');
        }
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

    // Handle dynamic segments (like setId)
    if (segment.match(/^\d+$/) || segment === params.setId) {
      title = setName || 'Loading...';
      // For set pages, link back to the sets list
      href = '/sets';
    } else {
      title = routeMap[segment] || segment;
      href = currentPath;
    }

    const isLast = i === pathSegments.length - 1;
    // Don't make the last item clickable, and don't make set name clickable if it's a set action page
    if (isLast || (segment === params.setId && i < pathSegments.length - 1)) {
      href = undefined;
    }

    breadcrumbItems.push({ title, href });  }

  // Don't show breadcrumbs on home page or sign-in page
  if (pathSegments.length === 0 || location.pathname === '/sign-in') {
    return null;
  }

  const items = breadcrumbItems.map((item, index) => {
    if (item.href) {
      return (
        <Anchor key={index} component={Link} to={item.href} size="sm" fw={500}>
          {item.title}
        </Anchor>
      );
    } else {
      return (
        <Text key={index} size="sm" c="dimmed" fw={500}>
          {item.title}
        </Text>
      );
    }
  });

  return (
    <MantineBreadcrumbs separator="/" mb="lg" mt="sm">
      {items}
    </MantineBreadcrumbs>
  );
}
