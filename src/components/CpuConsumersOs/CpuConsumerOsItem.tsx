import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumerOs from './CpuConsumerOs';
import CpuConsumerOsSingleUsage from './CpuConsumerOsSingleUsage';

type Props = {
  dumpsNumber: number;
  consumer: CpuConsumerOs;
};

export default class CpuConsumerOsItem extends React.PureComponent<Props> {
  private static formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => (
    `${value.toFixed(2)}% - "${CpuConsumerOsItem.getThreadName(threads)}"`
  );

  private static getThreadName = (threads: IterableIterator<Thread>): string => {
    for (const thread of threads) {
      if (thread) {
        return thread.name;
      }
    }
    return '';
  };

  public render(): JSX.Element {
    const { dumpsNumber, consumer } = this.props;

    const threadsPadded: Array<Thread | undefined> = [];
    for (let i = 0; i < dumpsNumber; i++) {
      threadsPadded.push(consumer.threadOccurrences.get(i));
    }

    return (
      <li>
        <h5 className="ellipsis">
          {CpuConsumerOsItem.formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurrences.values())}
        </h5>
        <span>
          {threadsPadded.map((thread, index) => (
            <CpuConsumerOsSingleUsage key={thread ? thread.uniqueId : `undefined_${index}`} thread={thread} />
          ))}
        </span>
      </li>
    );
  }
}
