import React from 'react';
import CpuUsageJfr from '../../parser/cpuusage/jfr/CpuUsageJfr';
import CpuConsumerJfrItem from './CpuConsumerJfrItem';

type Props = {
  cpuUsageJfrList: CpuUsageJfr[];
};

export default class CpuConsumersJfrList extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { cpuUsageJfrList } = this.props;

    return (
      <ul id="consumers-jfr-list">
        {cpuUsageJfrList.map((cpuUsageJfr) => (
          <CpuConsumerJfrItem key={cpuUsageJfr.filename} cpuUsageJfr={cpuUsageJfr} />
        ))}
      </ul>
    );
  }
}
