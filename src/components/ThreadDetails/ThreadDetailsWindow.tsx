import React from 'react';
import Thread from '../../types/Thread';
import './ThreadDetailsWindow.css';
import WindowPortal from './WindowPortal';
import ThreadDetailsHeader from './ThreadDetailsHeader';
import ThreadDetailsBody from './ThreadDetailsBody';

type Props = {
  thread: Thread;
  onUnload: () => void;
};

export default class ThreadDetailsWindow extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { thread, onUnload } = this.props;

    return (
      <WindowPortal windowTitle={thread.name} className="thread-details" onUnload={onUnload}>
        <ThreadDetailsHeader thread={thread} />
        <ThreadDetailsBody thread={thread} />
      </WindowPortal>
    );
  }
}
