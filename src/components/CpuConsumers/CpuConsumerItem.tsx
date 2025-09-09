import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

type Props = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

export default class CpuConsumerItem extends React.PureComponent<Props> {
  private static formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => (
    `${value.toFixed(2)}% - "${CpuConsumerItem.getThreadName(threads)}"`
  );

  private static getThreadName = (threads: IterableIterator<Thread>): string => {
    for (const thread of threads) {
      if (thread) {
        return thread.name;
      }
    }
    return '';
  };

  public override render(): JSX.Element {
    const { dumpsNumber, consumer } = this.props;

    const threadsPadded: Array<Thread | undefined> = [];
    for (let i = 0; i < dumpsNumber; i++) {
      threadsPadded.push(consumer.threadOccurrences.get(i));
    }

    return (
      <li>
        <h5 className="ellipsis">
          {CpuConsumerItem.formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurrences.values())}
        </h5>
        <span>
          {threadsPadded.map((thread, index) => (
            <CpuConsumerSingleUsage key={thread ? thread.uniqueId : `undefined_${index}`} thread={thread} />
          ))}
        </span>
      </li>
    );
  }
}
