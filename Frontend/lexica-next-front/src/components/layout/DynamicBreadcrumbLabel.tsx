import { Loader } from '@mantine/core';
import { BreadcrumbResolverData } from '../../AppRouter';

interface DynamicBreadcrumbLabelProps {
  resolver: BreadcrumbResolverData;
}

export function DynamicBreadcrumbLabel({ resolver }: DynamicBreadcrumbLabelProps) {
  const { label, isLoading } = resolver.useResolver(resolver.id);

  if (isLoading) {
    return (
      <>
        <Loader size={12} mr="5" />
        {label}
      </>
    );
  }

  return label;
}
