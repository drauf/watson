import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import RegexFilters from './RegexFilters';

vi.mock('./HoverPopup', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

describe('RegexFilters', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const renderFilters = (nameFilter = '', stackFilter = '') => {
    const onRegExpChange = vi.fn();
    const view = render(
      <RegexFilters
        nameFilter={nameFilter}
        stackFilter={stackFilter}
        onRegExpChange={onRegExpChange}
      />,
    );
    return { ...view, onRegExpChange };
  };

  it('commits the final typed name pattern after a pause', () => {
    vi.useFakeTimers();
    const { onRegExpChange } = renderFilters();
    const input = screen.getByLabelText('Thread name pattern');

    fireEvent.change(input, { target: { value: 'http' } });
    fireEvent.change(input, { target: { value: 'http-nio' } });
    vi.advanceTimersByTime(299);
    expect(onRegExpChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
    expect(onRegExpChange.mock.calls[0][0].target).toEqual({ name: 'nameFilter', value: 'http-nio' });
  });

  it('keeps a newer draft while the parent echoes an older committed value', () => {
    vi.useFakeTimers();
    const onRegExpChange = vi.fn();

    const DelayedParent = () => {
      const [nameFilter, setNameFilter] = useState('');
      return (
        <RegexFilters
          nameFilter={nameFilter}
          stackFilter=""
          onRegExpChange={(event) => {
            onRegExpChange(event);
            setTimeout(() => setNameFilter(event.target.value), 0);
          }}
        />
      );
    };

    render(<DelayedParent />);
    const input = screen.getByLabelText('Thread name pattern');

    fireEvent.change(input, { target: { value: 'http' } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(input, { target: { value: 'http-nio' } });
    act(() => vi.advanceTimersByTime(0));

    expect(input).toHaveValue('http-nio');
    act(() => vi.advanceTimersByTime(300));
    expect(onRegExpChange.mock.calls[1][0].target).toEqual({ name: 'nameFilter', value: 'http-nio' });
  });

  it('commits a clear immediately', () => {
    vi.useFakeTimers();
    const { onRegExpChange } = renderFilters('http-nio');

    fireEvent.change(screen.getByLabelText('Thread name pattern'), { target: { value: '' } });

    expect(onRegExpChange.mock.calls[0][0].target).toEqual({ name: 'nameFilter', value: '' });
    vi.runAllTimers();
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });

  it('flushes a pending stack pattern on Enter', () => {
    vi.useFakeTimers();
    const { onRegExpChange } = renderFilters();
    const input = screen.getByLabelText('Stack trace pattern');

    fireEvent.change(input, { target: { value: 'java\\.io' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRegExpChange.mock.calls[0][0].target).toEqual({ name: 'stackFilter', value: 'java\\.io' });
    vi.runAllTimers();
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });

  it('flushes a pending name pattern on blur', () => {
    vi.useFakeTimers();
    const { onRegExpChange } = renderFilters();
    const input = screen.getByLabelText('Thread name pattern');

    fireEvent.change(input, { target: { value: 'http-nio' } });
    fireEvent.blur(input);

    expect(onRegExpChange.mock.calls[0][0].target).toEqual({ name: 'nameFilter', value: 'http-nio' });
    vi.runAllTimers();
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });

  it('synchronizes its draft when the parent resets a filter', () => {
    const { rerender } = renderFilters('http-nio');

    rerender(<RegexFilters nameFilter="" stackFilter="" onRegExpChange={vi.fn()} />);

    expect(screen.getByLabelText('Thread name pattern')).toHaveValue('');
  });

  it('resyncs when the parent re-applies a value committed before a reset', () => {
    const { rerender } = renderFilters('http-nio');

    rerender(<RegexFilters nameFilter="" stackFilter="" onRegExpChange={vi.fn()} />);
    rerender(<RegexFilters nameFilter="http-nio" stackFilter="" onRegExpChange={vi.fn()} />);

    expect(screen.getByLabelText('Thread name pattern')).toHaveValue('http-nio');
  });
});
