import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { links, type IAppLink } from '../../config/links';
import { api } from '../../services/api-mock';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [setName, setSetName] = useState<string>('');

  const segmentLabels = useMemo(() => {
    return Object.values(links).reduce<Record<string, IAppLink>>((acc, link) => {
      acc[link.segment] = link;
      return acc;
    }, {});
  }, []);

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

  const breadcrumbItems: BreadcrumbItem[] = [{ title: links.home.label, href: links.home.url }];
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    let title: string;
    let href: string | undefined;
    if (segment.match(/^\d+$/) || segment === params.setId) {
      title = setName || 'Loading...';
    } else {
      title = segmentLabels[segment]?.label || segment;
      href = segmentLabels[segment]?.url;
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
