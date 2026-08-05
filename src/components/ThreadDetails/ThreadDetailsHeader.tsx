import Heading from '@atlaskit/heading';
import React, { type JSX } from 'react';
import Lozenge from '@atlaskit/lozenge/new';
import Thread from '../../types/Thread';
import { getCpuUsageLozengeAppearance } from '../CpuConsumers/cpuUsageAppearance';
import { getThreadStatusAppearance } from '../../common/threadStatusAppearance';

interface Props {
  thread: Thread;
}

export default class ThreadDetailsHeader extends React.PureComponent<Props> {
  private static renderName = (thread: Thread) => (
    <Heading as="h3" size="medium">
      {Thread.getFormattedTime(thread)}
      {' '}
      -
      {' '}
      <i>{thread.name}</i>
    </Heading>
  );

  private static renderMetadata = (thread: Thread) => (
    <div className="thread-details-metadata">
      <Lozenge
        appearance={getThreadStatusAppearance(thread.status)}
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
