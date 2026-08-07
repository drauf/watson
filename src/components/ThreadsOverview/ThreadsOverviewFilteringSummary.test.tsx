import { render, screen } from '@testing-library/react';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import Thread from '../../types/Thread';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

const thread = {} as Thread;

const createRow = (id: number, threadCount: number): ThreadOverviewDataRow => ({
  id,
  name: `thread-${id}`,
  threadsByDump: new Map(Array.from({ length: threadCount }, (_, index) => [index, thread])),
});

describe('ThreadsOverviewFilteringSummary', () => {
  it('shows only the row metric when only thread name filters are active', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack={false}
        threadsNumber={4}
        rows={[createRow(1, 2)]}
        matchingStackFilter={new Set()}
      />,
    );

    expect(screen.getByText('Showing 1 of 4 threads (25.0%)')).toBeInTheDocument();
    expect(screen.queryByText(/Highlighting/)).not.toBeInTheDocument();
  });

  it('shows the snapshot metric when every displayed row matches a stack trace filter', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack
        threadsNumber={2}
        rows={[createRow(1, 2), createRow(2, 1)]}
        matchingStackFilter={new Set([1, 2])}
      />,
    );

    expect(screen.getByText('Highlighting 2 matching thread snapshots')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('shows distinct row and snapshot metrics when both filters are active', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack
        threadsNumber={4}
        rows={[createRow(1, 2), createRow(2, 1)]}
        matchingStackFilter={new Set([1, 2])}
      />,
    );

    expect(screen.getByText('Showing 2 of 4 threads (50.0%)')).toBeInTheDocument();
    expect(screen.getByText('Highlighting 2 matching thread snapshots')).toBeInTheDocument();
  });

  it('shows zero percent when stack filtering has no matching rows', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack
        threadsNumber={2}
        rows={[]}
        matchingStackFilter={new Set()}
      />,
    );

    expect(screen.getByText('Showing 0 of 2 threads (0.0%)')).toBeInTheDocument();
    expect(screen.getByText('Highlighting 0 matching thread snapshots')).toBeInTheDocument();
  });

  it('does not render a summary without active filters', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack={false}
        threadsNumber={2}
        rows={[createRow(1, 1), createRow(2, 1)]}
        matchingStackFilter={new Set()}
      />,
    );

    expect(document.getElementById('matching-summary')).toBeEmptyDOMElement();
  });
});
