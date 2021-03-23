import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

type Props = {
  dumpsNumber: number;
  consumer: CpuConsumer;
};

export default class CpuConsumerItem extends React.PureComponent<Props> {
  private formatConsumerHeader = (value: number, threads: IterableIterator<Thread>): string => (
    `${value.toFixed(2)}% - "${this.getThreadName(threads)}"`
  );

  private getThreadName = (threads: IterableIterator<Thread>): string => {
    for (const thread of threads) {
      if (thread) {
        return thread.name;
      }
    }
    return '';
  };

  public render(): JSX.Element {
    const { dumpsNumber, consumer } = this.props;

    const threads: Array<Thread | undefined> = [];
    for (let i = 0; i < dumpsNumber; i++) {
      threads.push(consumer.threadOccurrences.get(i));
    }

    return (
      <li>
        <h5 className="ellipsis">
          {this.formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurrences.values())}
        </h5>
        <span>
          {threads.map((thread, index) => (
            <CpuConsumerSingleUsage key={thread ? thread.uniqueId : `undefined_${index}`} thread={thread} />
          ))}
        </span>
      </li>
    );
  }
}
