import { render, screen } from '@testing-library/react';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import Thread from '../../types/Thread';

const thread = {} as Thread;

describe('ThreadsOverviewFilteringSummary', () => {
  it('shows only the row metric when only thread name filters are active', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack={false}
        threadsNumber={4}
        threadDumps={[
          new Map([[1, thread], [2, thread]]),
        ]}
        matchingStackFilter={new Set()}
      />,
    );

    expect(screen.getByText('Showing 1 of 4 threads (25.0%)')).toBeInTheDocument();
    expect(screen.queryByText(/Highlighting/)).not.toBeInTheDocument();
  });

  it('shows only the snapshot metric when only stack trace filters are active', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack
        threadsNumber={2}
        threadDumps={[
          new Map([[1, thread], [2, thread]]),
          new Map([[3, thread]]),
        ]}
        matchingStackFilter={new Set([1, 2])}
      />,
    );

    expect(screen.getByText('Highlighting 2 of 3 thread snapshots (66.7%)')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('shows distinct row and snapshot metrics when both filters are active', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack
        threadsNumber={4}
        threadDumps={[
          new Map([[1, thread], [2, thread]]),
          new Map([[3, thread]]),
        ]}
        matchingStackFilter={new Set([1, 2])}
      />,
    );

    expect(screen.getByText('Showing 2 of 4 threads (50.0%)')).toBeInTheDocument();
    expect(screen.getByText('Highlighting 2 of 3 thread snapshots (66.7%)')).toBeInTheDocument();
  });

  it('does not render a summary without active filters', () => {
    render(
      <ThreadsOverviewFilteringSummary
        isFilteredByStack={false}
        threadsNumber={2}
        threadDumps={[
          new Map([[1, thread]]),
          new Map([[2, thread]]),
        ]}
        matchingStackFilter={new Set()}
      />,
    );

    expect(document.getElementById('matching-summary')).toBeEmptyDOMElement();
  });
});
