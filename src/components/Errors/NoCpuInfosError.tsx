import EmptyState from './EmptyState';

const NoCpuInfosError = (): JSX.Element => (
  <EmptyState
    fullPage
    title="No CPU usage data found"
    description="Upload top output or a supported JFR containing CPU usage data, then try this view again."
  />
);

export default NoCpuInfosError;
