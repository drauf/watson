import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  maxDifferingLines: number;
  showStackTrace: boolean;
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
      <>
        <h6>
          <a onClick={this.handleClick} title="Open thread details in a new window">
            {Thread.getFormattedTime(thread)}
          </a>
        </h6>

        {this.props.showStackTrace &&
          <ol className="stacktrace">
            {stack.map((line, index) => (
              <li key={index}>{line}</li>))}
          </ol>}

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }

  private handleClick = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }
}
