import React from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';
import getCpuUsageAppearance from './cpuUsageAppearance';

interface Props {
  thread: Thread | undefined;
}

const getCpuUsage = (cpuUsage: string): string => `${cpuUsage}%`;
export default class CpuConsumerSingleUsage extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { thread } = this.props;

    if (!thread) {
      return (
        <>
          <span className="cpu-consumer-usage no-click">n/a</span>
          {' '}
        </>
      );
    }

    const cpuUsage = parseFloat(thread.cpuUsage);
    const className = 'cpu-consumer-usage';

    return (
      <>
        <OpenThreadDetailsButton
          appearance={getCpuUsageAppearance(cpuUsage)}
          className={className}
          shouldFitContainer
          spacing="compact"
          text={getCpuUsage(thread.cpuUsage)}
          thread={thread}
        />
        {' '}
      </>
    );
  }
}
