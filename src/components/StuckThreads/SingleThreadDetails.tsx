import React, { type JSX } from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  maxDifferingLines: number;
  showStackTrace: boolean;
  thread: Thread;
}

export default class SingleThreadDetails extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { thread, maxDifferingLines, showStackTrace } = this.props;
    const stack = thread.stackTrace.slice(0, Math.max(maxDifferingLines, 10));
    const lineOccurrences = new Map<string, number>();

    return (
      <>
        <OpenThreadDetailsButton
          text={Thread.getFormattedTime(thread)}
          thread={thread}
        />

        {showStackTrace && (
          <p className="stacktrace-container">
            {stack.map((line) => {
              const occurrence = lineOccurrences.get(line) ?? 0;
              lineOccurrences.set(line, occurrence + 1);
              return <code key={`${line}:${occurrence}`}>{line}</code>;
            })}
          </p>
        )}
      </>
    );
  }
}
