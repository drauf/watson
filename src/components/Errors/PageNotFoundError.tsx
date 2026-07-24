import EmptyState from './EmptyState';

const PageNotFoundError = (): JSX.Element => (
  <EmptyState
    fullPage
    title="Page not found"
    description="Oops, you've found a dead link."
  />
);

export default PageNotFoundError;
