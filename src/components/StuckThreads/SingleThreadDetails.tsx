import React, { type JSX } from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';
import StackTrace from '../common/StackTrace';
import './SingleThreadDetails.css';

interface Props {
  maxDifferingLines: number;
  showStackTrace: boolean;
  thread: Thread;
}

export default class SingleThreadDetails extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { thread, maxDifferingLines, showStackTrace } = this.props;

    return (
      <>
        <OpenThreadDetailsButton
          text={Thread.getFormattedTime(thread)}
          thread={thread}
        />

        {showStackTrace
          && <StackTrace stackTrace={thread.stackTrace} linesToConsider={Math.max(maxDifferingLines, 10)} />}
      </>
    );
  }
}
