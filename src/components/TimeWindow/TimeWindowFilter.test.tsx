import { fireEvent, render, screen } from '@testing-library/react';
import ThreadDump from '../../types/ThreadDump';
import { TimeWindowProvider } from '../../context/TimeWindowContext';
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

  it('shows separate date and time inputs when thread dumps cross midnight', () => {
    renderFilter([
      new ThreadDump(Date.UTC(2026, 6, 23, 23, 59)),
      new ThreadDump(Date.UTC(2026, 6, 24, 0, 1)),
    ]);

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));

    expect(screen.getByLabelText('From date')).toHaveValue('2026-07-23');
    expect(screen.getByLabelText('From time')).toHaveValue('23:59:00');
    expect(screen.getByLabelText('To date')).toHaveValue('2026-07-24');
    expect(screen.getByLabelText('To time')).toHaveValue('00:01:00');
    expect(screen.getByText(/2026-07-23 23:59:00 - 2026-07-24 00:01:00/)).toBeInTheDocument();
  });

  it('clamps typed times to the loaded range', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    fireEvent.change(screen.getByLabelText('From time'), { target: { value: '08:00:00' } });

    expect(screen.getByLabelText('From time')).toHaveValue('09:00:00');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('keeps the applied range unchanged until the preview is applied', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    fireEvent.change(screen.getByLabelText('From time'), { target: { value: '09:00:01' } });

    expect(screen.getByText('Applying this range will show 2 thread dumps.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    expect(screen.getByText(/showing\s*3\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText('No changes to apply.')).toBeInTheDocument();
    expect(screen.getByText(/showing\s*2\s*of\s*3\s*thread dumps/i)).toBeInTheDocument();
  });

  it('snaps a dragged start handle to loaded timestamps', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));

    const timeline = screen.getByLabelText('Time window timeline');
    Object.defineProperty(timeline, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 100 }),
    });

    fireEvent.pointerDown(timeline.querySelector('.time-window-handle-start')!, { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 50 });
    fireEvent.pointerUp(window);

    expect(screen.getByLabelText('From time')).toHaveValue('09:00:01');
    expect(screen.getByLabelText('To time')).toHaveValue('09:00:02');
  });

  it('resets an edited preview back to the applied time window', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    fireEvent.change(screen.getByLabelText('From time'), { target: { value: '09:00:01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    fireEvent.change(screen.getByLabelText('From time'), { target: { value: '09:00:02' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('From time')).toHaveValue('09:00:01');
    expect(screen.getByLabelText('To time')).toHaveValue('09:00:02');
  });

  it('clears a pending preview when showing all thread dumps', () => {
    renderFilter(createThreadDumps(3));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    fireEvent.change(screen.getByLabelText('From time'), { target: { value: '09:00:01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show all...' }));

    expect(screen.getByText('No changes to apply.')).toBeInTheDocument();
    expect(screen.getByLabelText('From time')).toHaveValue('09:00:00');
  });

  it('confirms before applying a preview with more than 100 thread dumps', () => {
    renderFilter(createThreadDumps(102));

    fireEvent.click(screen.getByRole('button', { name: /time window/i }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '09:00:01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Large time window selected' });
    expect(dialog).toHaveTextContent(/covers\s*101\s*thread dumps/);

    fireEvent.click(screen.getAllByRole('button', { name: 'Close dialog' })[0]);

    expect(screen.queryByRole('alertdialog', { name: 'Large time window selected' })).not.toBeInTheDocument();
  });
});
