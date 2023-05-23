import React from 'react';
import ThreadCpuUsageJfr from '../../parser/cpuusage/jfr/ThreadCpuUsageJfr';

type Props = {
  cpuUsageJfr: ThreadCpuUsageJfr | undefined;
};

export default class CpuConsumerJfrSingleUsage extends React.PureComponent<Props> {
  private static getClassName = (cpuUsage: string): string => {
    const cpuUsageNumber = parseFloat(cpuUsage.replace('%', ''));

    if (cpuUsageNumber > 50) {
      return 'high';
    }
    if (cpuUsageNumber > 20) {
      return 'medium';
    }
    if (cpuUsageNumber > 5) {
      return 'low';
    }
    return 'none';
  };

  public render(): JSX.Element {
    const { cpuUsageJfr } = this.props;

    if (!cpuUsageJfr) {
      return (
        <tr />
      );
    }

    const cpuUserModeClassName = CpuConsumerJfrSingleUsage.getClassName(cpuUsageJfr.cpuUserMode);
    const cpuSystemModeClassName = CpuConsumerJfrSingleUsage.getClassName(cpuUsageJfr.cpuSystemMode);

    return (
      <tr>
        <td>{cpuUsageJfr.threadName}</td>
        <td>{cpuUsageJfr.jvmThreadId}</td>
        <td>{cpuUsageJfr.osThreadId}</td>
        <td>{cpuUsageJfr.systemTime}</td>
        <td>
          <button type="button" className={cpuUserModeClassName}>{cpuUsageJfr.cpuUserMode}</button>
        </td>
        <td>
          <button type="button" className={cpuSystemModeClassName}>{cpuUsageJfr.cpuSystemMode}</button>
        </td>
      </tr>
    );
  }
}
