import React from 'react';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';
import './CpuConsumersList.css';

type CpuConsumersListProps = {
  limit: number;
  dumpsNumber: number;
  consumers: CpuConsumer[];
};

const CpuConsumersList: React.SFC<CpuConsumersListProps> = ({ limit, dumpsNumber, consumers }) => (
  <ul className="consumers-list">
    {consumers.slice(0, limit).map((consumer, index) => (
      <CpuConsumerItem key={index} dumpsNumber={dumpsNumber} consumer={consumer} />
    ))}
  </ul>
);

export default CpuConsumersList;
