import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type Props = {
  maxDifferingLines: number;
  showStackTrace: boolean;
  thread: Thread;
};

export default class SingleThreadDetails extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { thread, maxDifferingLines, showStackTrace } = this.props;
    const stack = thread.stackTrace.slice(0, Math.max(maxDifferingLines, 10));

    return (
      <>
        <ThreadDetails text={Thread.getFormattedTime(thread)} className="single-thread-details" thread={thread} />

        {showStackTrace && (
          <ol className="stacktrace">
            {stack.map((line) => (
              <li>{line}</li>))}
          </ol>
        )}
      </>
    );
  }
}
