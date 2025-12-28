import { Group, Loader, Text } from '@mantine/core';
import { BreadcrumbResolverData } from '../../AppRouter';

interface DynamicBreadcrumbLabelProps {
  resolver: BreadcrumbResolverData;
}

export function DynamicBreadcrumbLabel({ resolver }: DynamicBreadcrumbLabelProps) {
  const { label, isLoading } = resolver.useResolver(resolver.id);

  if (isLoading) {
    return (
      <Group gap={6}>
        <Loader size={12} />
        <Text component="span" opacity={0.6} size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
      </Group>
    );
  }

  return (
    <Text component="span" size="sm" c="dimmed" fw={500}>
      {label}
    </Text>
  );
}
