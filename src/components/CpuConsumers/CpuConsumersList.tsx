import React from 'react';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';

type Props = {
  limit: number;
  dumpsNumber: number;
  consumers: CpuConsumer[];
};

export default class CpuConsumersList extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { limit, dumpsNumber, consumers } = this.props;

    return (
      <ul id="consumers-list">
        {consumers.slice(0, limit).map((consumer) => (
          <CpuConsumerItem key={consumer.uniqueId} dumpsNumber={dumpsNumber} consumer={consumer} />
        ))}
      </ul>
    );
  }
}
