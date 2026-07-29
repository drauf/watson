import Lozenge from '@atlaskit/lozenge/new';
import React from 'react';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupHeader from '../common/GroupHeader';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';

interface Props {
  dumpsNumber: number;
  consumer: CpuConsumer;
}

const formatUsage = (usage: number): string => `${usage.toFixed(2)}%`;

const getUsageAppearance = (usage: number) => {
  if (usage > 78) {
    return 'danger' as const;
  }

  if (usage > 42) {
    return 'warning' as const;
  }

  if (usage > 10) {
    return 'information' as const;
  }

  return 'neutral' as const;
};

export default class CpuConsumerItem extends React.PureComponent<Props> {
  private static getThreadName = (threads: IterableIterator<Thread>): string => {
    for (const thread of threads) {
      if (thread) {
        return thread.name;
      }
    }
    return '';
  };

  public override render(): JSX.Element {
    const { consumer, dumpsNumber } = this.props;
    const { max, mean, median } = consumer.summary;
    const threadName = CpuConsumerItem.getThreadName(consumer.threadOccurrences.values());
    const threadsPadded: (Thread | undefined)[] = [];

    for (let i = 0; i < dumpsNumber; i++) {
      threadsPadded.push(consumer.threadOccurrences.get(i));
    }

    const header = (
      <GroupHeader
        leading={(
          <>
            <Lozenge appearance={getUsageAppearance(mean)} trailingMetric={formatUsage(mean)}>
              Mean
            </Lozenge>
            <Lozenge appearance={getUsageAppearance(median)} trailingMetric={formatUsage(median)}>
              Median
            </Lozenge>
            <Lozenge appearance={getUsageAppearance(max)} trailingMetric={formatUsage(max)}>
              Max
            </Lozenge>
          </>
        )}
        title={threadName}
        metadata={null}
      />
    );
    const content = (
      <div className="cpu-consumer-usages">
        {threadsPadded.map((thread, index) => (
          <CpuConsumerSingleUsage
            key={thread ? thread.uniqueId : `undefined_${index}`}
            thread={thread}
          />
        ))}
      </div>
    );

    return <CollapsableGroup initiallyCollapsed header={header} content={content} />;
  }
}
