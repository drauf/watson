import EmptyState from './EmptyState';

const NoThreadDumpsError = (): JSX.Element => (
  <EmptyState
    fullPage
    title="No thread dumps found"
    description="Upload at least one thread dump to use this view."
  />
);

export default NoThreadDumpsError;
