import * as React from 'react';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';
import './CpuConsumersList.css';

interface CpuConsumersListProps {
  limit: number;
  consumers: CpuConsumer[];
}

const CpuConsumersList: React.SFC<CpuConsumersListProps> = ({ limit, consumers }) => (
  <ul className="consumers-list">
    {consumers.slice(0, limit).map((consumer, index) => (
      <CpuConsumerItem index={index} consumer={consumer} />
    ))}
  </ul>
)

export default CpuConsumersList;
