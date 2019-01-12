import * as React from 'react';
import CpuConsumer from './CpuConsumer';

interface CpuConsumerItemProps {
  dumpsNumber: number;
  consumer: CpuConsumer;
}

const CpuConsumerItem: React.SFC<CpuConsumerItemProps> = ({ dumpsNumber, consumer }) => {
  const cpuUsages: string[] = [];
  const threadInfo = consumer.threadOccurences.values().next().value;

  for (let i = 0; i < dumpsNumber; i++) {
    const thread = consumer.threadOccurences.get(i);
    if (thread) {
      cpuUsages.push(`${thread.cpuUsage}%`);
    } else {
      cpuUsages.push(`-`);
    }
  }

  return (
    <li>
      <h6>{consumer.calculatedValue.toFixed(2)}% - "{threadInfo.name}", running for {threadInfo.runningFor}</h6>
      [ {cpuUsages.join(" | ")} ]
  </li>
  )
}

export default CpuConsumerItem;
