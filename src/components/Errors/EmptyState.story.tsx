import { ThemeProvider } from '../../context/ThemeContext';
import NoCpuInfosAndThreadDumpPairError from './NoCpuInfosAndThreadDumpPairError';
import NoThreadDumpsError from './NoThreadDumpsError';

export const NoThreadDumps = () => (
  <ThemeProvider>
    <NoThreadDumpsError />
  </ThemeProvider>
);

export const UnmatchedCpuUsageData = () => (
  <ThemeProvider>
    <NoCpuInfosAndThreadDumpPairError />
  </ThemeProvider>
);
