import EmptyState, { EmptyStateContent } from './EmptyState';

export const unmatchedCpuUsageDataEmptyState: EmptyStateContent = {
  title: 'CPU usage data could not be matched to a thread dump',
  description: 'Upload thread dumps and CPU usage data captured at the same time, then try this view again.',
};

const NoCpuInfosAndThreadDumpPairError = (): JSX.Element => (
  <EmptyState fullPage {...unmatchedCpuUsageDataEmptyState} />
);

export default NoCpuInfosAndThreadDumpPairError;
