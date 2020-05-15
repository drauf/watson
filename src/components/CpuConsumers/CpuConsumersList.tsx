import React from 'react';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';

type Props = {
  limit: number;
  dumpsNumber: number;
  consumers: CpuConsumer[];
};

const CpuConsumersList: React.SFC<Props> = ({ limit, dumpsNumber, consumers }) => (
  <>
    <span>You can click on a lozenge to open the thread details window.</span>

    <ul id="consumers-list">
      {consumers.slice(0, limit).map((consumer, index) => (
        <CpuConsumerItem key={index} dumpsNumber={dumpsNumber} consumer={consumer} />
      ))}
    </ul>
  </>
);

export default CpuConsumersList;
