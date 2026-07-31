import ButtonGroup from '@atlaskit/button/button-group';
import Button from '@atlaskit/button/new';
import SectionMessage from '@atlaskit/section-message';
import Inline from '@atlaskit/primitives/inline';
import Stack from '@atlaskit/primitives/stack';
import Text from '@atlaskit/primitives/text';
import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import {
  filterThreadDumpsByTimeWindow,
  getClosestTimestamp,
  getThreadDumpTimestamps,
  TimeWindow,
} from '../../common/timeWindow';
import { useTimeWindow } from '../../context/TimeWindowContext';
import CollapsableGroup from '../CollapsableGroup';
import LargeRangeConfirmationDialog from './LargeRangeConfirmationDialog';
import './TimeWindowFilter.css';

const MAX_RECOMMENDED_THREAD_DUMPS = 100;

type DragMode = 'start' | 'end' | 'window';

const formatTime = (epoch: number): string => {
  const date = new Date(epoch);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatDate = (epoch: number): string => {
  const date = new Date(epoch);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sameCalendarDay = (firstEpoch: number, secondEpoch: number): boolean => {
  const first = new Date(firstEpoch);
  const second = new Date(secondEpoch);
  return first.getUTCFullYear() === second.getUTCFullYear()
    && first.getUTCMonth() === second.getUTCMonth()
    && first.getUTCDate() === second.getUTCDate();
};

const formatWindow = (timeWindow: TimeWindow): string => (
  sameCalendarDay(timeWindow.startEpoch, timeWindow.endEpoch)
    ? `${formatTime(timeWindow.startEpoch)} - ${formatTime(timeWindow.endEpoch)}`
    : `${formatDate(timeWindow.startEpoch)} ${formatTime(timeWindow.startEpoch)} - ${formatDate(timeWindow.endEpoch)} ${formatTime(timeWindow.endEpoch)}`
);

const timeWindowEquals = (first: TimeWindow, second: TimeWindow): boolean => (
  first.startEpoch === second.startEpoch && first.endEpoch === second.endEpoch
);

const clamp = (value: number, minimum: number, maximum: number): number => (
  Math.min(Math.max(value, minimum), maximum)
);

const epochAtPosition = (position: number, bounds: TimeWindow): number => (
  Math.round(bounds.startEpoch + (position * (bounds.endEpoch - bounds.startEpoch)))
);

const positionForEpoch = (epoch: number, bounds: TimeWindow): number => (
  (epoch - bounds.startEpoch) / (bounds.endEpoch - bounds.startEpoch)
);

const TimeWindowFilter = (): JSX.Element | null => {
  const {
    allThreadDumps,
    appliedTimeWindow,
    bounds,
    distinctTimestampCount,
    previewTimeWindow,
    applyPreviewTimeWindow,
    resetPreviewTimeWindow,
    setPreviewTimeWindow,
  } = useTimeWindow();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>();
  const dragStartPosition = useRef<number | undefined>(undefined);
  const dragStartWindow = useRef<TimeWindow | undefined>(undefined);
  const timeline = useRef<HTMLDivElement>(null);

  const appliedWindow = appliedTimeWindow ?? bounds;
  const previewWindow = previewTimeWindow ?? bounds;
  const timestamps = useMemo(() => getThreadDumpTimestamps(allThreadDumps), [allThreadDumps]);
  const previewThreadDumpCount = useMemo(
    () => (previewWindow ? filterThreadDumpsByTimeWindow(allThreadDumps, previewWindow).length : 0),
    [allThreadDumps, previewWindow],
  );
  const hasPendingChanges = Boolean(appliedWindow && previewWindow && !timeWindowEquals(appliedWindow, previewWindow));
  const previewIsLarge = previewThreadDumpCount > MAX_RECOMMENDED_THREAD_DUMPS;
  const appliedThreadDumpCount = appliedWindow
    ? filterThreadDumpsByTimeWindow(allThreadDumps, appliedWindow).length
    : allThreadDumps.length;
  const appliedSummary = appliedWindow
    ? `${formatWindow(appliedWindow)} · showing ${appliedThreadDumpCount} of ${allThreadDumps.length} thread dumps`
    : `showing ${appliedThreadDumpCount} thread dumps`;

  useEffect(() => {
    const startPosition = dragStartPosition.current;
    const startWindow = dragStartWindow.current;
    if (!dragMode || !bounds || !timeline.current || startPosition === undefined || !startWindow) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = timeline.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const position = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const pointerEpoch = epochAtPosition(position, bounds);
      const draggedEpoch = getClosestTimestamp(timestamps, pointerEpoch);
      if (draggedEpoch === undefined) {
        return;
      }

      if (dragMode === 'start') {
        setPreviewTimeWindow({
          startEpoch: Math.min(draggedEpoch, startWindow.endEpoch),
          endEpoch: startWindow.endEpoch,
        });
      } else if (dragMode === 'end') {
        setPreviewTimeWindow({
          startEpoch: startWindow.startEpoch,
          endEpoch: Math.max(draggedEpoch, startWindow.startEpoch),
        });
      } else {
        const startTimestamp = getClosestTimestamp(timestamps, startWindow.startEpoch);
        const endTimestamp = getClosestTimestamp(timestamps, startWindow.endEpoch);
        if (startTimestamp === undefined || endTimestamp === undefined) {
          return;
        }

        const selectedStartIndex = timestamps.indexOf(startTimestamp);
        const selectedEndIndex = timestamps.indexOf(endTimestamp);
        const selectedTimestampSpan = selectedEndIndex - selectedStartIndex;
        const movement = pointerEpoch - epochAtPosition(startPosition, bounds);
        const movedStartTimestamp = getClosestTimestamp(timestamps, startTimestamp + movement);
        if (movedStartTimestamp === undefined) {
          return;
        }

        const movedStartIndex = timestamps.indexOf(movedStartTimestamp);
        const nextStartIndex = clamp(
          movedStartIndex,
          0,
          timestamps.length - selectedTimestampSpan - 1,
        );
        setPreviewTimeWindow({
          startEpoch: timestamps[nextStartIndex],
          endEpoch: timestamps[nextStartIndex + selectedTimestampSpan],
        });
      }
    };

    const stopDragging = () => setDragMode(undefined);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  }, [bounds, dragMode, setPreviewTimeWindow, timestamps]);

  if (distinctTimestampCount < 2 || !bounds || !appliedWindow || !previewWindow) {
    return null;
  }

  const startDragging = (mode: DragMode, event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = timeline.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    dragStartPosition.current = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    dragStartWindow.current = previewWindow;
    setDragMode(mode);
    event.preventDefault();
  };

  const applyPreview = () => {
    if (previewIsLarge) {
      setConfirmationOpen(true);
      return;
    }

    applyPreviewTimeWindow();
  };

  const applyLargePreview = () => {
    applyPreviewTimeWindow();
    setConfirmationOpen(false);
  };

  const appliedIsLarge = appliedThreadDumpCount > MAX_RECOMMENDED_THREAD_DUMPS;
  const noPendingChangesMessage = appliedIsLarge
    ? `Showing ${appliedThreadDumpCount} thread dumps, which may make analysis pages slow.`
    : 'No changes to apply.';
  const pendingChangesMessage = previewIsLarge
    ? `Applying this range will show ${previewThreadDumpCount} thread dumps. Large ranges can slow analysis pages.`
    : `Applying this range will show ${previewThreadDumpCount} thread dumps.`;
  const previewMessage = `Selected range: ${formatWindow(previewWindow)}. ${
    hasPendingChanges ? pendingChangesMessage : noPendingChangesMessage
  }`;
  const previewIsWarning = (previewIsLarge && hasPendingChanges) || (appliedIsLarge && !hasPendingChanges);
  const previewTitle = previewIsWarning ? 'Large time window' : 'Time window';
  const largeRangeMessage = `The selected time window covers ${previewThreadDumpCount} thread dumps from ${formatWindow(previewWindow)}.\nLarge time windows can slow analysis pages.`;
  const selectionStart = positionForEpoch(previewWindow.startEpoch, bounds) * 100;
  const selectionWidth = (positionForEpoch(previewWindow.endEpoch, bounds) * 100) - selectionStart;
  const header = (
    <Inline as="span" alignBlock="center" space="space.150">
      <Text as="span" weight="bold">Time window</Text>
      <Text as="span" color="color.text.subtle">{appliedSummary}</Text>
    </Inline>
  );

  const content = (
    <Stack space="space.100">
      <SectionMessage appearance={previewIsWarning ? 'warning' : 'information'} title={previewTitle}>
        {previewMessage}
      </SectionMessage>

      <div ref={timeline} className="time-window-timeline" aria-label="Time window timeline">
        <div
          className="time-window-selection"
          style={{ left: `${selectionStart}%`, width: `${selectionWidth}%` }}
          onPointerDown={(event) => startDragging('window', event)}
        >
          <div
            className="time-window-handle time-window-handle-start"
            onPointerDown={(event) => {
              event.stopPropagation();
              startDragging('start', event);
            }}
          />
          <div
            className="time-window-handle time-window-handle-end"
            onPointerDown={(event) => {
              event.stopPropagation();
              startDragging('end', event);
            }}
          />
        </div>
        <div className="time-window-labels">
          <Text as="span">{formatTime(bounds.startEpoch)}</Text>
          <Text as="span">{formatTime(bounds.endEpoch)}</Text>
        </div>
      </div>

      <ButtonGroup>
        <Button
          appearance="primary"
          type="button"
          onClick={applyPreview}
          isDisabled={!hasPendingChanges}
        >
          Apply
        </Button>
        <Button appearance="default" onClick={resetPreviewTimeWindow} isDisabled={!hasPendingChanges}>Reset</Button>
        <Button appearance="default" onClick={() => setPreviewTimeWindow()}>Show all...</Button>
      </ButtonGroup>
    </Stack>
  );

  return (
    <>
      <CollapsableGroup header={header} content={content} />

      {confirmationOpen && (
        <LargeRangeConfirmationDialog
          message={largeRangeMessage}
          onClose={() => setConfirmationOpen(false)}
          onAnalyze={applyLargePreview}
        />
      )}
    </>
  );
};

export default TimeWindowFilter;
