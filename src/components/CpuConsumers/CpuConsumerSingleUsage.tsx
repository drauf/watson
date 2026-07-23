import React from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  thread: Thread | undefined;
}

export default class CpuConsumerSingleUsage extends React.PureComponent<Props> {
  private static getCpuUsage = (cpuUsage: string): string => `${cpuUsage}%`;

  private static getClassName = (cpuUsage: string): string => {
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

  public override render(): JSX.Element {
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
        <OpenThreadDetailsButton text={cpuUsage} className={className} thread={thread} />
        {' '}
      </>
    );
  }
}
