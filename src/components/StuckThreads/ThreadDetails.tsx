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
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: false };
  }

  private handleClick = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  private handleUnload = () => {
    this.setState({ showDetails: false });
  };

  public render(): JSX.Element {
    const { thread, maxDifferingLines, showStackTrace } = this.props;
    const { showDetails } = this.state;
    const stack = thread.stackTrace.slice(0, Math.max(maxDifferingLines, 10));

    return (
      <>
        <h6>
          <button type="button" onClick={this.handleClick}>
            {Thread.getFormattedTime(thread)}
          </button>
        </h6>

        {showStackTrace && (
          <ol className="stacktrace">
            {stack.map((line) => (
              <li key={line}>{line}</li>))}
          </ol>
        )}

        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
