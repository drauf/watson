import Thread from '../types/Thread';
import { isAnyThreadLabelFilterActive, matchesThreadLabelFilters, ThreadLabelFilters } from './threadLabelFiltering';
import { ThreadLabel } from './threadLabels';

const labeledThread = (labels: ThreadLabel[]): Thread => {
  const thread = new Thread(1, 'worker-1');
  thread.labels = labels;
  return thread;
};

describe('threadLabelFiltering', () => {
  describe('matchesThreadLabelFilters', () => {
    it('matches any thread when no label filters are active', () => {
      expect(matchesThreadLabelFilters(labeledThread([]), {})).toBe(true);
    });

    it('requires every active label filter to be present on the thread', () => {
      const thread = labeledThread([ThreadLabel.DATABASE, ThreadLabel.CPU_ACTIVE]);

      expect(matchesThreadLabelFilters(thread, { database: true, cpuActive: true })).toBe(true);
      expect(matchesThreadLabelFilters(thread, { database: true, userDirectory: true })).toBe(false);
    });

    it.each([
      ['http', ThreadLabel.HTTP],
      ['background', ThreadLabel.BACKGROUND],
      ['indexSearch', ThreadLabel.INDEX_SEARCH],
      ['database', ThreadLabel.DATABASE],
      ['userDirectory', ThreadLabel.USER_DIRECTORY],
      ['cpuActive', ThreadLabel.CPU_ACTIVE],
    ] as const)('filters by the %s label', (filterKey, label) => {
      const filters: ThreadLabelFilters = { [filterKey]: true };

      expect(matchesThreadLabelFilters(labeledThread([label]), filters)).toBe(true);
      expect(matchesThreadLabelFilters(labeledThread([]), filters)).toBe(false);
    });

    it('rejects every thread when contradictory label filters are selected', () => {
      const filters: ThreadLabelFilters = { http: true, background: true };

      expect(matchesThreadLabelFilters(labeledThread([ThreadLabel.HTTP]), filters)).toBe(false);
      expect(matchesThreadLabelFilters(labeledThread([ThreadLabel.BACKGROUND]), filters)).toBe(false);
    });
  });

  describe('isAnyThreadLabelFilterActive', () => {
    it('is false when every filter is unset', () => {
      expect(isAnyThreadLabelFilterActive({})).toBe(false);
    });

    it.each(['http', 'background', 'indexSearch', 'database', 'userDirectory', 'cpuActive'] as const)(
      'is true when %s is active',
      (filterKey) => {
        expect(isAnyThreadLabelFilterActive({ [filterKey]: true })).toBe(true);
      },
    );
  });
});
