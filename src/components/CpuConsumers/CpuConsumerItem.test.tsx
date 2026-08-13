import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';

vi.mock('@atlaskit/lozenge/new', () => ({
  default: ({ appearance, children, trailingMetric }: { appearance: string; children: string; trailingMetric?: string }) => (
    <span data-appearance={appearance}>
      {children}
      {' '}
      {trailingMetric}
    </span>
  ),
}));
vi.mock('../CollapsableGroup', () => ({
  default: ({ header, content }: { header: ReactNode; content: ReactNode }) => (
    <>
      {header}
      {content}
    </>
  ),
}));
vi.mock('../common/GroupHeader', () => ({
  default: ({ leading, title, metadata }: { leading: ReactNode; title: string; metadata: ReactNode }) => (
    <section aria-label={title}>
      {leading}
      {metadata}
    </section>
  ),
}));
vi.mock('./CpuConsumerSingleUsage', () => ({
  default: ({ thread }: { thread: Thread | undefined }) => <span>{thread?.name ?? 'n/a'}</span>,
}));

const createThread = (id: number, name: string): Thread => new Thread(id, name);

describe('CpuConsumerItem', () => {
  it('renders threshold appearances and pads sparse occurrences across dumps', () => {
    const first = createThread(1, 'first worker');
    const last = createThread(2, 'last worker');
    const consumer = new CpuConsumer(0, { mean: 79, median: 43, max: 11 }, new Map([[0, first], [2, last]]));

    render(<CpuConsumerItem dumpsNumber={3} consumer={consumer} />);

    expect(screen.getByLabelText('first worker')).toHaveTextContent('Mean 79.00%Median 43.00%Max 11.00%');
    expect(screen.getByText('Mean 79.00%')).toHaveAttribute('data-appearance', 'danger');
    expect(screen.getByText('Median 43.00%')).toHaveAttribute('data-appearance', 'warning');
    expect(screen.getByText('Max 11.00%')).toHaveAttribute('data-appearance', 'information');
    expect(screen.getAllByText('n/a')).toHaveLength(1);
    expect(screen.getByText('first worker')).toBeInTheDocument();
    expect(screen.getByText('last worker')).toBeInTheDocument();
  });

  it('uses neutral summaries and an empty title when no thread occurrence exists', () => {
    const consumer = new CpuConsumer(0, { mean: 10, median: 42, max: 78 }, new Map());

    render(<CpuConsumerItem dumpsNumber={2} consumer={consumer} />);

    expect(screen.getByLabelText('')).toHaveTextContent('Mean 10.00%Median 42.00%Max 78.00%');
    expect(screen.getAllByText('n/a')).toHaveLength(2);
    for (const [metric, appearance] of [
      ['Mean 10.00%', 'neutral'],
      ['Median 42.00%', 'information'],
      ['Max 78.00%', 'warning'],
    ]) {
      expect(screen.getByText(metric)).toHaveAttribute('data-appearance', appearance);
    }
  });
});
