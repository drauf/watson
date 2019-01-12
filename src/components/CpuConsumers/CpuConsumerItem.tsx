import * as React from 'react';
import CpuConsumer from './CpuConsumer';

interface CpuConsumerItemProps {
  index: number;
  consumer: CpuConsumer;
}

const CpuConsumerItem: React.SFC<CpuConsumerItemProps> = ({ index, consumer }) => (
  <li key={index}>
    <h6>{consumer.calculatedValue.toFixed(2)}% - "{consumer.threadOccurences[0].name}", running for {consumer.threadOccurences[0].runningFor}</h6>
    [ {consumer.threadOccurences.map(thread => thread.cpuUsage).join(" | ")} ]
  </li>
)

export default CpuConsumerItem;
