import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type CpuConsumerSingleUsageProps = {
  thread: Thread | undefined;
};

type CpuConsumerSingleUsageState = {
  showDetails: boolean;
};

export default class CpuConsumerSingleUsage
  extends React.PureComponent<CpuConsumerSingleUsageProps, CpuConsumerSingleUsageState> {

  public state: CpuConsumerSingleUsageState = {
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
      return <span className="monospaced">     -- </span>;
    }

    const cpuUsage = `${thread.cpuUsage.toFixed(1)}%`;
    const padding = ' '.repeat(8 - cpuUsage.length);
    let className = thread.cpuUsage > 78
      ? 'high '
      : thread.cpuUsage > 42
        ? 'mid '
        : thread.cpuUsage > 13
          ? 'low '
          : thread.cpuUsage > 0
            ? 'vlow '
            : '';
    className += 'cpu-usage';

    return (
      <>
        <span>{padding}</span>
        <span className={className} onClick={this.handleClick}>{cpuUsage}</span>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
