import React from 'react';
import CpuConsumerOs from './CpuConsumerOs';
import CpuConsumerOsItem from './CpuConsumerOsItem';

type Props = {
  limit: number;
  dumpsNumber: number;
  consumers: CpuConsumerOs[];
};

export default class CpuConsumersOsList extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { limit, dumpsNumber, consumers } = this.props;

    return (
      <ul id="consumers-list">
        {consumers.slice(0, limit).map((consumer) => (
          <CpuConsumerOsItem key={consumer.uniqueId} dumpsNumber={dumpsNumber} consumer={consumer} />
        ))}
      </ul>
    );
  }
}
