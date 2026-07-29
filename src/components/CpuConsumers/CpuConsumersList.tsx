import React from 'react';
import PaginatedCollection from '../common/PaginatedCollection';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';

interface Props {
  dumpsNumber: number;
  consumers: CpuConsumer[];
  resetKey: string;
}

export default class CpuConsumersList extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { dumpsNumber, consumers, resetKey } = this.props;

    return (
      <div id="consumers-list">
        <PaginatedCollection
          items={consumers}
          resetKey={resetKey}
          getKey={(consumer) => consumer.uniqueId}
          renderItem={(consumer) => <CpuConsumerItem dumpsNumber={dumpsNumber} consumer={consumer} />}
        />
      </div>
    );
  }
}
