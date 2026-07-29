import React from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  thread: Thread | undefined;
}

type CpuUsageAppearance = 'danger' | 'warning' | 'primary' | 'default';

const getCpuUsage = (cpuUsage: string): string => `${cpuUsage}%`;

// The numbers here are completely arbitrary
const getAppearance = (cpuUsage: number): CpuUsageAppearance => {
  if (cpuUsage > 78) {
    return 'danger';
  }
  if (cpuUsage > 42) {
    return 'warning';
  }
  if (cpuUsage > 10) {
    return 'primary';
  }
  return 'default';
};
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
          appearance={getAppearance(cpuUsage)}
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
