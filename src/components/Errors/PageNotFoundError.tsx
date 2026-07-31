import type { JSX } from 'react';
import EmptyState, { EmptyStateContent } from './EmptyState';

export const pageNotFoundEmptyState: EmptyStateContent = {
  title: 'Page not found',
  description: "Oops, you've found a dead link.",
};

const PageNotFoundError = (): JSX.Element => (
  <EmptyState fullPage {...pageNotFoundEmptyState} />
);

export default PageNotFoundError;
