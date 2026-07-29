import Thread from '../../types/Thread';
import { getCpuUsageSummary } from './cpuUsageSummary';

const threadWithUsage = (cpuUsage: string): Thread => ({ cpuUsage } as Thread);

describe('getCpuUsageSummary', () => {
  it('includes missing dumps as zero for mean while preserving observed median', () => {
    expect(getCpuUsageSummary([
      threadWithUsage('20.00'),
      threadWithUsage('40.00'),
    ], 4)).toEqual({
      mean: 15,
      median: 30,
      max: 40,
    });
  });
});
