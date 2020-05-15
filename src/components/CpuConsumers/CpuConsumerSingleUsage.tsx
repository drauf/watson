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
      return <button className="no-click">n/a</button>;
    }

    const cpuUsage = this.getCpuUsage(thread.cpuUsage);
    const className = this.getClassName(thread.cpuUsage);

    return (
      <>
        <button className={className} onClick={this.handleClick}>{cpuUsage}</button>
        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }

  private getCpuUsage = (cpuUsage: number): string => {
    return `${cpuUsage.toFixed(1)}%`;
  }

  private getClassName = (cpuUsage: number): string => {
    // The numbers here are completely arbitrary
    if (cpuUsage > 78) {
      return 'high';
    }
    if (cpuUsage > 42) {
      return 'medium';
    }
    if (cpuUsage > 10) {
      return 'low';
    }
    return 'none';
  }
}
