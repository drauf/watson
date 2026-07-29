import NoCpuInfosAndThreadDumpPairError from './NoCpuInfosAndThreadDumpPairError';
import NoThreadDumpsError from './NoThreadDumpsError';

export const NoThreadDumps = () => <NoThreadDumpsError />;

export const UnmatchedCpuUsageData = () => <NoCpuInfosAndThreadDumpPairError />;
