import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Thread from '../../types/Thread';
import WaitingList from './WaitingList';

const createWaitingThreads = (count: number): Thread[] => Array.from(
  { length: count },
  (_, index) => new Thread(index + 1, `worker-${index + 1}`),
);

test('does not render an expansion control for twenty waiting threads', () => {
  render(<WaitingList waiting={createWaitingThreads(20)} />);

  expect(screen.getByText('worker-20')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /thread list/ })).not.toBeInTheDocument();
});

test('expands and collapses the twenty-first waiting thread', () => {
  render(<WaitingList waiting={createWaitingThreads(21)} />);

  const toggle = screen.getByRole('button', { name: 'Expand thread list (1 more thread to show)' });
  expect(screen.queryByText('worker-21')).not.toBeInTheDocument();

  fireEvent.click(toggle);
  expect(screen.getByText('worker-21')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Collapse thread list (hide 1 thread)' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Collapse thread list (hide 1 thread)' }));
  expect(screen.queryByText('worker-21')).not.toBeInTheDocument();
});
