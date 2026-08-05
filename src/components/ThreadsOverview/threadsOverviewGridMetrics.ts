export const threadsOverviewGridMetrics = {
  headerHeight: 32,
  minimumDumpColumnWidth: 48,
  rowHeight: 32,
  threadNameColumnWidth: 240,
} as const;
export const getResolvedThreadsOverviewDumpColumnWidth = (
  dumpColumnWidth: number,
  dumpCount: number,
  bodyWidth: number,
): number => {
  const minimumWidth = dumpColumnWidth || threadsOverviewGridMetrics.minimumDumpColumnWidth;
  return dumpCount > 0 ? Math.max(minimumWidth, bodyWidth / dumpCount) : minimumWidth;
};
