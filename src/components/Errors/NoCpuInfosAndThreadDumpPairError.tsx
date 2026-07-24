import EmptyState from './EmptyState';

const NoCpuInfosAndThreadDumpPairError = (): JSX.Element => (
  <EmptyState
    fullPage
    title="CPU usage data could not be matched to a thread dump"
    description="Upload thread dumps and CPU usage data captured at the same time, then try this view again."
  />
);

export default NoCpuInfosAndThreadDumpPairError;
