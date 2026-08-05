import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { TimeWindowProvider } from '../../context/TimeWindowContext';
import ThreadDump from '../../types/ThreadDump';
import TimeWindowFilter from './TimeWindowFilter';

const createThreadDumps = (count: number): ThreadDump[] => Array.from(
  { length: count },
  (_, index) => new ThreadDump(Date.UTC(2026, 6, 22, 9, 0, index)),
);

const renderFilter = (threadDumps: ThreadDump[]) => render(
  <TimeWindowProvider threadDumps={threadDumps}>
    <TimeWindowFilter />
  </TimeWindowProvider>,
);

const dragStartHandle = (position: number): void => {
  const timeline = screen.getByLabelText('Time window timeline');
  Object.defineProperty(timeline, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ left: 0, width: 100 }),
  });

  fireEvent.pointerDown(timeline.querySelector('.time-window-handle-start')!, { clientX: 0 });
  fireEvent.pointerMove(window, { clientX: position });
  fireEvent.pointerUp(window);
};

describe('TimeWindowFilter', () => {
  it('does not render for a single timestamp', () => {
    renderFilter([new ThreadDump(Date.UTC(2026, 6, 22, 9, 0))]);

    expect(screen.queryByRole('button', { name: /time window/i })).not.toBeInTheDocument();
  });

  it('updates its expanded state when toggled', () => {
    renderFilter(createThreadDumps(2));

    const toggle = screen.getByRole('button', { name: /time window/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the full date range when thread dumps cross midnight', () => {
    renderFilter([
      new ThreadDump(Date.UTC(2026, 6, 23, 23, 59)),
      new ThreadDump(Date.UTC(2026, 6, 24, 0, 1)),
    ]);

    expect(screen.getByText(/2026-07-23 23:59:00 - 2026-07-24 00:01:00/)).toBeInTheDocument();
  });

  it('keeps the applied range unchanged until a dragged preview is applied', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    dragStartHandle(50);

    expect(screen.getByText(/Selected: 09:00:01 - 09:00:02 · 2 of 3 thread dumps/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    expect(screen.getByText(/showing\s*3\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText(/Selected: 09:00:01 - 09:00:02 · 2 of 3 thread dumps/)).toBeInTheDocument();
    expect(screen.getByText(/showing\s*2\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();
  });

  it('resets a dragged preview back to the applied range', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    dragStartHandle(50);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    dragStartHandle(100);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByText(/Selected: 09:00:01 - 09:00:02 · 2 of 3 thread dumps/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(screen.getByText(/showing\s*2\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();
  });

  it('clears an applied preview when showing all thread dumps', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    dragStartHandle(50);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    fireEvent.click(screen.getByRole('button', { name: 'All thread dumps' }));

    expect(screen.getByText(/Selected: 09:00:00 - 09:00:02 · 3 of 3 thread dumps/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText(/Selected: 09:00:00 - 09:00:02 · 3 of 3 thread dumps/)).toBeInTheDocument();
    expect(screen.getByText(/showing\s*3\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();
  });

  it('applies a large preview without confirmation', () => {
    renderFilter(createThreadDumps(102));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    dragStartHandle(1);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText(/showing\s*101\s*of\s*102\s*thread dumps/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
