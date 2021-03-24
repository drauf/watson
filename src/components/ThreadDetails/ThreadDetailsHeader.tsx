import React from 'react';
import Thread from '../../types/Thread';

type Props = {
  thread: Thread;
};

export default class ThreadDetailsHeader extends React.PureComponent<Props> {
  private renderName = (thread: Thread) => (
    <h3>
      {Thread.getFormattedTime(thread)}
      {' '}
      -
      {' '}
      <i>{thread.name}</i>
    </h3>
  );

  private renderStatus = (thread: Thread) => (
    <div>
      State:
      <span className={`thread-state ${thread.status}`}>
        {thread.status.toLocaleUpperCase()}
      </span>
    </div>
  );

  private getCpuUsageClassName = (cpuUsage: number): string => {
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

  private renderCpuUsage = (thread: Thread) => (
    <div>
      CPU usage:
      <span className={`thread-state ${this.getCpuUsageClassName(thread.cpuUsage)}`}>
        {thread.cpuUsage.toFixed(1)}
        %
      </span>
    </div>
  );

  private renderRunningFor = (thread: Thread) => (
    <div>
      Running for:
      {' '}
      {thread.runningFor}
    </div>
  );

  public render(): JSX.Element {
    const { thread } = this.props;

    return (
      <div className="details-header">
        {this.renderName(thread)}
        {this.renderStatus(thread)}
        {this.renderCpuUsage(thread)}
        {this.renderRunningFor(thread)}
      </div>
    );
  }
}
