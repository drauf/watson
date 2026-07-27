import EmptyState, { EmptyStateContent } from './EmptyState';

export const noThreadCpuUsageDataEmptyState: EmptyStateContent = {
  title: 'No thread CPU usage data found',
  description: 'Upload a JFR bundle containing thread CPU usage data, then try this view again.',
};

const NoCpuConsumersJfrDataError = (): JSX.Element => (
  <EmptyState fullPage {...noThreadCpuUsageDataEmptyState} />
);

export default NoCpuConsumersJfrDataError;
