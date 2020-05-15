import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

type Props = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

const CpuConsumerItem: React.SFC<Props> = ({ dumpsNumber, consumer }) => {
  const threads: Array<Thread | undefined> = [];

  for (let i = 0; i < dumpsNumber; i++) {
    threads.push(consumer.threadOccurences.get(i));
  }

  return (
    <li>
      <h5 className="clickable">
        {formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurences.values())}
      </h5>
      <span className="mono">
        {threads.map((thread, index) => <CpuConsumerSingleUsage thread={thread} key={index} />)}
      </span>
    </li>
  );
};

const formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => {
  let threadName: string = '';

  for (const thread of threads) {
    if (thread) {
      threadName = thread.name;
    }
  }

  return (
    `${value.toFixed(2)}% - "${threadName}"`
  );
};

export default CpuConsumerItem;
