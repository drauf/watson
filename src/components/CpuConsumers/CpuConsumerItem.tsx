import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

type Props = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

const getThreadName = (threads: IterableIterator<Thread>): string => {
  for (const thread of threads) {
    if (thread) {
      return thread.name;
    }
  }
  return '';
};

const formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => (
  `${value.toFixed(2)}% - "${getThreadName(threads)}"`
);

const CpuConsumerItem: React.FunctionComponent<Props> = ({ dumpsNumber, consumer }) => {
  const threads: Array<Thread | undefined> = [];

  for (let i = 0; i < dumpsNumber; i++) {
    threads.push(consumer.threadOccurences.get(i));
  }

  return (
    <li>
      <h5 className="ellipsis">
        {formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurences.values())}
      </h5>
      <span>
        {threads.map((thread, index) => <CpuConsumerSingleUsage key={thread ? thread.uniqueId : `undefined_${index}`} thread={thread} />)}
      </span>
    </li>
  );
};

export default CpuConsumerItem;
