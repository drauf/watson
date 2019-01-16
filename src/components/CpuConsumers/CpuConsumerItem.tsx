import React from 'react';
import CpuConsumer from './CpuConsumer';

type CpuConsumerItemProps = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

const formatConsumerHeader = (value: number, threadName: string, runningFor: string): string => (
  `${value.toFixed(2)}% - "${threadName}", running for ${runningFor}`
);

const CpuConsumerItem: React.SFC<CpuConsumerItemProps> = ({ dumpsNumber, consumer }) => {
  const cpuUsages: string[] = [];
  const threadInfo = consumer.threadOccurences.values().next().value;

  for (let i = 0; i < dumpsNumber; i++) {
    const thread = consumer.threadOccurences.get(i);
    if (thread) {
      cpuUsages.push(`${thread.cpuUsage.toFixed(1).padStart(5)}%`);
    } else {
      cpuUsages.push('  --  ');
    }
  }

  return (
    <li>
      <h6>
        {formatConsumerHeader(consumer.calculatedValue, threadInfo.name, threadInfo.runningFor)}
      </h6>
      <span className="monospaced">[ {cpuUsages.join(' | ')} ]</span>
    </li>
  );
};

export default CpuConsumerItem;
