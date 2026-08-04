import {
  getAvailableThreadsOverviewGridHeight,
  getResolvedThreadsOverviewDumpColumnWidth,
  threadsOverviewGridMetrics,
} from './threadsOverviewGridMetrics';

describe('threadsOverviewGridMetrics', () => {
  it('keeps one data row visible when the grid starts near the viewport bottom', () => {
    expect(getAvailableThreadsOverviewGridHeight(800, 790)).toBe(
      threadsOverviewGridMetrics.headerHeight + threadsOverviewGridMetrics.rowHeight,
    );
  });

  it('uses the remaining viewport height when enough space is available', () => {
    expect(getAvailableThreadsOverviewGridHeight(800, 200)).toBe(584);
  });

  it('uses the configured dump width as a minimum', () => {
    expect(getResolvedThreadsOverviewDumpColumnWidth(160, 3, 600)).toBe(200);
  });

  it('uses the readable minimum width in fit-columns mode', () => {
    expect(getResolvedThreadsOverviewDumpColumnWidth(0, 3, 0)).toBe(
      threadsOverviewGridMetrics.minimumDumpColumnWidth,
    );
  });
});
