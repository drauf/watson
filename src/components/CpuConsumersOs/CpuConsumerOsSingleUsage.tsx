import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread: Thread | undefined;
};

type State = {
  showDetails: boolean;
};

export default class CpuConsumerOsSingleUsage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: false };
  }

  public handleClick = (): void => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  public handleUnload = (): void => {
    this.setState({ showDetails: false });
  };

  private static getCpuUsage = (cpuUsage: number): string => `${cpuUsage.toFixed(1)}%`;

  private static getClassName = (cpuUsage: number): string => {
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
  };

  public render(): JSX.Element {
    const { thread } = this.props;

    if (!thread) {
      return (
        <>
          <button type="button" className="no-click">n/a</button>
          {' '}
        </>
      );
    }

    const { showDetails } = this.state;
    const cpuUsage = CpuConsumerOsSingleUsage.getCpuUsage(thread.cpuUsage);
    const className = CpuConsumerOsSingleUsage.getClassName(thread.cpuUsage);

    return (
      <>
        <button type="button" className={className} onClick={this.handleClick}>{cpuUsage}</button>
        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
        {' '}
      </>
    );
  }
}
