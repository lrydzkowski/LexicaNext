import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface PageWithBreadcrumbsProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
}

export function PageWithBreadcrumbs({ children, showBreadcrumbs = true }: PageWithBreadcrumbsProps) {
  return (
    <>
      {showBreadcrumbs && <Breadcrumbs />}
      {children}
    </>
  );
}
