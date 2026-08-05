import {
  getResolvedThreadsOverviewDumpColumnWidth,
  threadsOverviewGridMetrics,
} from './threadsOverviewGridMetrics';

describe('threadsOverviewGridMetrics', () => {
  it('uses the configured dump width as a minimum', () => {
    expect(getResolvedThreadsOverviewDumpColumnWidth(160, 3, 600)).toBe(200);
  });

  it('uses the readable minimum width in fit-columns mode', () => {
    expect(getResolvedThreadsOverviewDumpColumnWidth(0, 3, 0)).toBe(
      threadsOverviewGridMetrics.minimumDumpColumnWidth,
    );
  });
});
