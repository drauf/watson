import React from 'react';
import Lozenge from '@atlaskit/lozenge/new';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { getCpuUsageLozengeAppearance } from '../CpuConsumers/cpuUsageAppearance';

interface Props {
  thread: Thread;
}

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

  private static getStatusAppearance = (status: ThreadStatus) => {
    switch (status) {
      case ThreadStatus.RUNNABLE:
        return 'success' as const;
      case ThreadStatus.BLOCKED:
        return 'danger' as const;
      case ThreadStatus.WAITING:
        return 'discovery' as const;
      case ThreadStatus.TIMED_WAITING:
        return 'warning' as const;
      default:
        return 'neutral' as const;
    }
  };

  private static renderMetadata = (thread: Thread) => (
    <div className="thread-details-metadata">
      <Lozenge
        appearance={ThreadDetailsHeader.getStatusAppearance(thread.status)}
        trailingMetric={thread.status.toLocaleUpperCase()}
      >
        Thread state
      </Lozenge>
      <Lozenge
        appearance={getCpuUsageLozengeAppearance(parseFloat(thread.cpuUsage))}
        trailingMetric={`${thread.cpuUsage}%`}
      >
        CPU usage
      </Lozenge>
      <Lozenge appearance="neutral" trailingMetric={thread.runningFor}>Running for</Lozenge>
    </div>
  );

  public override render(): JSX.Element {
    const { thread } = this.props;

    return (
      <div className="details-header">
        {ThreadDetailsHeader.renderName(thread)}
        {ThreadDetailsHeader.renderMetadata(thread)}
      </div>
    );
  }
}
