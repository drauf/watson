import { useEffect } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ThreadDump from '../types/ThreadDump';
import {
  TimeWindowProvider, useTimeWindow, useTimeWindowData,
} from './TimeWindowContext';

const threadDumps = [
  new ThreadDump(Date.UTC(2026, 6, 22, 9, 25)),
  new ThreadDump(Date.UTC(2026, 6, 22, 9, 30)),
  new ThreadDump(Date.UTC(2026, 6, 22, 9, 35)),
];

interface AppliedDataConsumerProps {
  onRender: () => void;
}

const AppliedDataConsumer = ({ onRender }: AppliedDataConsumerProps) => {
  const { threadDumps: activeThreadDumps } = useTimeWindowData();

  useEffect(() => {
    onRender();
  });

  return <output data-testid="applied-data-thread-dumps">{activeThreadDumps.length}</output>;
};

const PreviewControls = () => {
  const { applyPreviewTimeWindow, setPreviewTimeWindow } = useTimeWindow();

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewTimeWindow({
          startEpoch: threadDumps[1].epoch,
          endEpoch: threadDumps[2].epoch,
        })}
      >
        Preview last two
      </button>
      <button type="button" onClick={applyPreviewTimeWindow}>Apply preview</button>
    </>
  );
};

const TimeWindowConsumer = () => {
  const {
    allThreadDumps,
    appliedTimeWindow,
    previewTimeWindow,
    threadDumps: activeThreadDumps,
    applyPreviewTimeWindow,
    resetPreviewTimeWindow,
    setPreviewTimeWindow,
  } = useTimeWindow();

  return (
    <>
      <output data-testid="all-thread-dumps">{allThreadDumps.length}</output>
      <output data-testid="active-thread-dumps">{activeThreadDumps.length}</output>
      <output data-testid="applied-window">{appliedTimeWindow ? `${appliedTimeWindow.startEpoch}-${appliedTimeWindow.endEpoch}` : 'all'}</output>
      <output data-testid="preview-window">{previewTimeWindow ? `${previewTimeWindow.startEpoch}-${previewTimeWindow.endEpoch}` : 'all'}</output>
      <button
        type="button"
        onClick={() => setPreviewTimeWindow({
          startEpoch: threadDumps[1].epoch,
          endEpoch: threadDumps[2].epoch,
        })}
      >
        Preview last two
      </button>
      <button type="button" onClick={applyPreviewTimeWindow}>Apply preview</button>
      <button type="button" onClick={resetPreviewTimeWindow}>Reset preview</button>
    </>
  );
};

describe('TimeWindowProvider', () => {
  it('does not re-render applied-data consumers while previewing a range', () => {
    let appliedDataRenderCount = 0;
    const onAppliedDataRender = () => {
      appliedDataRenderCount += 1;
    };

    render(
      <TimeWindowProvider threadDumps={threadDumps}>
        <AppliedDataConsumer onRender={onAppliedDataRender} />
        <PreviewControls />
      </TimeWindowProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview last two' }));

    expect(appliedDataRenderCount).toBe(1);
    expect(screen.getByTestId('applied-data-thread-dumps')).toHaveTextContent('3');

    fireEvent.click(screen.getByRole('button', { name: 'Apply preview' }));

    expect(appliedDataRenderCount).toBe(2);
    expect(screen.getByTestId('applied-data-thread-dumps')).toHaveTextContent('2');
  });

  it('keeps all thread dumps active until a preview is applied', () => {
    render(
      <TimeWindowProvider threadDumps={threadDumps}>
        <TimeWindowConsumer />
      </TimeWindowProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview last two' }));

    expect(screen.getByTestId('all-thread-dumps')).toHaveTextContent('3');
    expect(screen.getByTestId('active-thread-dumps')).toHaveTextContent('3');
    expect(screen.getByTestId('applied-window')).toHaveTextContent('all');
    expect(screen.getByTestId('preview-window')).toHaveTextContent(`${threadDumps[1].epoch}-${threadDumps[2].epoch}`);
  });

  it('filters active thread dumps only after applying the preview', () => {
    render(
      <TimeWindowProvider threadDumps={threadDumps}>
        <TimeWindowConsumer />
      </TimeWindowProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview last two' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply preview' }));

    expect(screen.getByTestId('all-thread-dumps')).toHaveTextContent('3');
    expect(screen.getByTestId('active-thread-dumps')).toHaveTextContent('2');
    expect(screen.getByTestId('applied-window')).toHaveTextContent(`${threadDumps[1].epoch}-${threadDumps[2].epoch}`);
  });

  it('resets a preview back to the applied time window', () => {
    render(
      <TimeWindowProvider threadDumps={threadDumps}>
        <TimeWindowConsumer />
      </TimeWindowProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview last two' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset preview' }));

    expect(screen.getByTestId('preview-window')).toHaveTextContent(`${threadDumps[1].epoch}-${threadDumps[2].epoch}`);
  });
});
