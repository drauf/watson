import React from 'react';
import Thread from '../../types/Thread';
import CpuConsumer from './CpuConsumer';
import CpuConsumerSingleUsage from './CpuConsumerSingleUsage';
import '../common/ExpandableSurface.css';

interface Props {
  dumpsNumber: number;
  consumer: CpuConsumer;
}

interface State {
  collapsed: boolean;
}

export default class CpuConsumerItem extends React.PureComponent<Props, State> {
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

  constructor(props: Props) {
    super(props);
    this.state = { collapsed: false };
  }

  private toggleCollapsed = () => {
    this.setState((previousState) => ({ collapsed: !previousState.collapsed }));
  };

  public override render(): JSX.Element {
    const { dumpsNumber, consumer } = this.props;
    const { collapsed } = this.state;
    const threadsPadded: (Thread | undefined)[] = [];
    for (let i = 0; i < dumpsNumber; i++) {
      threadsPadded.push(consumer.threadOccurrences.get(i));
    }

    return (
      <li className={`cpu-consumer-item expandable-surface${collapsed ? '' : ' expandable-surface-expanded'}`}>
        <button
          type="button"
          className="expandable-surface-toggle ellipsis"
          aria-expanded={!collapsed}
          onClick={this.toggleCollapsed}
        >
          <span className={collapsed ? 'chevron rotate' : 'chevron'} />
          {CpuConsumerItem.formatConsumerHeader(consumer.calculatedValue, consumer.threadOccurrences.values())}
        </button>

        {!collapsed && (
          <span className="cpu-consumer-usages expandable-surface-content">
            {threadsPadded.map((thread, index) => (
              <CpuConsumerSingleUsage key={thread ? thread.uniqueId : `undefined_${index}`} thread={thread} />
            ))}
          </span>
        )}
      </li>
    );
  }
}
