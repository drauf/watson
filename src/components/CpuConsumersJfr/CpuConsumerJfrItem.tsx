import React from 'react';
import CpuConsumerJfrSingleUsage from './CpuConsumerJfrSingleUsage';
import CpuUsageJfr from '../../parser/cpuusage/jfr/CpuUsageJfr';

type Props = {
  cpuUsageJfr: CpuUsageJfr;
};

export default class CpuConsumerJfrItem extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { cpuUsageJfr } = this.props;

    return (
      <li>
        <h5>{cpuUsageJfr.filename}</h5>
        <table>
          <tbody>
            <tr>
              <th>Thread name</th>
              <th>JVM ID</th>
              <th>OS ID</th>
              <th>System time</th>
              <th>CPU user mode</th>
              <th>CPU system mode</th>
            </tr>
            {cpuUsageJfr.threadCpuUsages.map((threadCpuUsageJfr) => (
              <CpuConsumerJfrSingleUsage
                key={threadCpuUsageJfr.jvmThreadId + threadCpuUsageJfr.osThreadId + threadCpuUsageJfr.systemTime}
                cpuUsageJfr={threadCpuUsageJfr}
              />
            ))}
          </tbody>
        </table>
      </li>
    );
  }
}
