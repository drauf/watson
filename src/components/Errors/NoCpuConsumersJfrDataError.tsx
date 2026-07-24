import EmptyState from './EmptyState';

const NoCpuConsumersJfrDataError = (): JSX.Element => (
  <EmptyState
    fullPage
    title="No thread CPU usage data found"
    description="Upload a JFR bundle containing thread CPU usage data, then try this view again."
  />
);

export default NoCpuConsumersJfrDataError;
