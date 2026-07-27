import EmptyState, { EmptyStateContent } from './EmptyState';

export const noCpuUsageDataEmptyState: EmptyStateContent = {
  title: 'No CPU usage data found',
  description: 'Upload top output or a supported JFR containing CPU usage data, then try this view again.',
};

const NoCpuInfosError = (): JSX.Element => (
  <EmptyState fullPage {...noCpuUsageDataEmptyState} />
);

export default NoCpuInfosError;
