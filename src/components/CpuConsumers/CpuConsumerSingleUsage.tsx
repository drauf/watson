import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread: Thread | undefined;
};

type State = {
  showDetails: boolean;
};

export default class CpuConsumerSingleUsage extends React.PureComponent<Props, State> {

  public state: State = {
    showDetails: false,
  };

  public handleClick = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  public handleUnload = () => {
    this.setState({ showDetails: false });
  }

  public render() {
    const thread = this.props.thread;

    if (!thread) {
      return <>     -- </>;
    }

    const cpuUsage = `${thread.cpuUsage.toFixed(1)}%`;
    const padding = ' '.repeat(8 - cpuUsage.length);
    const className = thread.cpuUsage > 78
      ? 'vhigh'
      : thread.cpuUsage > 42
        ? 'high'
        : thread.cpuUsage > 21
          ? 'mid'
          : thread.cpuUsage > 10
            ? 'low'
            : 'vlow';

    return (
      <>
        {padding}
        <a className={className} onClick={this.handleClick}>{cpuUsage}</a>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
