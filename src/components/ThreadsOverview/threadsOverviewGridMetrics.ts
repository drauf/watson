export const threadsOverviewGridMetrics = {
  headerHeight: 32,
  minimumDumpColumnWidth: 48,
  rowHeight: 32,
  threadNameColumnWidth: 240,
  viewportBottomGutter: 16,
} as const;

export const getAvailableThreadsOverviewGridHeight = (
  viewportHeight: number,
  gridTop: number,
): number => Math.max(
  threadsOverviewGridMetrics.headerHeight + threadsOverviewGridMetrics.rowHeight,
  viewportHeight - gridTop - threadsOverviewGridMetrics.viewportBottomGutter,
);
export const getResolvedThreadsOverviewDumpColumnWidth = (
  dumpColumnWidth: number,
  dumpCount: number,
  bodyWidth: number,
): number => {
  const minimumWidth = dumpColumnWidth || threadsOverviewGridMetrics.minimumDumpColumnWidth;
  return dumpCount > 0 ? Math.max(minimumWidth, bodyWidth / dumpCount) : minimumWidth;
};
