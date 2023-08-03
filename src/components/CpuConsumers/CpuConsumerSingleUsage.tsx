import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type Props = {
  thread: Thread | undefined;
};

export default class CpuConsumerSingleUsage extends React.PureComponent<Props> {
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

    const cpuUsage = CpuConsumerSingleUsage.getCpuUsage(thread.cpuUsage);
    const className = CpuConsumerSingleUsage.getClassName(thread.cpuUsage);

    return (
      <>
        <ThreadDetails text={cpuUsage} className={className} thread={thread} />
        {' '}
      </>
    );
  }
}
