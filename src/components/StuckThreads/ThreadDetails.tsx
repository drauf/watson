import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  maxDifferingLines: number;
  thread: Thread;
};

type State = {
  showDetails: boolean;
};

export default class ThreadDetails extends React.PureComponent<Props, State> {
  public state: State = {
    showDetails: false,
  };

  public render() {
    const thread = this.props.thread;
    const stack = thread.stackTrace.slice(0, Math.max(this.props.maxDifferingLines, 10));

    return (
      <p>
        <b>{Thread.getFormattedTime(thread)} </b>

        <ul className="stacktrace">
          {stack.map((line, index) => (
            <li key={index}>{line}</li>))}
          <li><a onClick={this.handleClick}>See thread details</a></li>
        </ul>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </p>
    );
  }

  private handleClick = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }
}
