import EmptyState, { EmptyStateContent } from './EmptyState';

export const noThreadDumpsEmptyState: EmptyStateContent = {
  title: 'No thread dumps found',
  description: 'Upload at least one thread dump to use this view.',
};

const NoThreadDumpsError = (): JSX.Element => (
  <EmptyState fullPage {...noThreadDumpsEmptyState} />
);

export default NoThreadDumpsError;
