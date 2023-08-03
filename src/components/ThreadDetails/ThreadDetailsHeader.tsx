import React from 'react';
import Thread from '../../types/Thread';

type Props = {
  thread: Thread;
};

export default class ThreadDetailsHeader extends React.PureComponent<Props> {
  private static renderName = (thread: Thread) => (
    <h3>
      {Thread.getFormattedTime(thread)}
      {' '}
      -
      {' '}
      <i>{thread.name}</i>
    </h3>
  );

  private static renderStatus = (thread: Thread) => (
    <div>
      State:
      <span className={`thread-state ${thread.status}`}>
        {thread.status.toLocaleUpperCase()}
      </span>
    </div>
  );

  private static getCpuUsageClassName = (cpuUsage: string): string => {
    const cpuUsageNumber = parseFloat(cpuUsage);

    // The numbers here are completely arbitrary
    if (cpuUsageNumber > 78) {
      return 'high';
    }
    if (cpuUsageNumber > 42) {
      return 'medium';
    }
    if (cpuUsageNumber > 10) {
      return 'low';
    }
    return 'none';
  };

  private static renderCpuUsage = (thread: Thread) => (
    <div>
      CPU usage:
      <span className={`thread-state ${ThreadDetailsHeader.getCpuUsageClassName(thread.cpuUsage)}`}>
        {thread.cpuUsage}
        %
      </span>
    </div>
  );

  private static renderRunningFor = (thread: Thread) => (
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
        {ThreadDetailsHeader.renderName(thread)}
        {ThreadDetailsHeader.renderStatus(thread)}
        {ThreadDetailsHeader.renderCpuUsage(thread)}
        {ThreadDetailsHeader.renderRunningFor(thread)}
      </div>
    );
  }
}
