import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

type CpuConsumerItemProps = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

const formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => {
  let threadName: string = '';
  let runningFor: string = 'unknown';

  for (const thread of threads) {
    if (thread && thread.runningFor) {
      threadName = thread.name;
      runningFor = thread.runningFor;
    }
  }

  return (
    `${value.toFixed(2)}% - "${threadName}", running for ${runningFor}`
  );
};

const CpuConsumerItem: React.SFC<CpuConsumerItemProps> = ({ dumpsNumber, consumer }) => {
  const threads: Array<Thread | undefined> = [];

  for (let i = 0; i < dumpsNumber; i++) {
    threads.push(consumer.threadOccurences.get(i));
  }

  return (
    <li>
      <h6>
        {formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurences.values())}
      </h6>
      <span className="monospaced">
        {threads.map((thread, index) => <CpuConsumerSingleUsage thread={thread} key={index} />)}
      </span>
    </li>
  );
};

export default CpuConsumerItem;
