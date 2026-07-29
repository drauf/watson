import Button from '@atlaskit/button/new';
import React from 'react';
import Thread from '../../types/Thread';
import StackTrace from './StackTrace';
import ThreadSummary from './ThreadSummary';

interface Props {
  threadGroup: Thread[];
  linesToConsider: number;
}

interface State {
  expanded: boolean;
}

export default class GroupDetails extends React.PureComponent<Props, State> {
  private static THREADS_TO_SHOW_WHEN_COLLAPSED = 20;

  constructor(props: Props) {
    super(props);
    this.state = { expanded: false };
  }

  private static getStackTrace = (threads: Thread[]): string[] => {
    for (const thread of threads) {
      if (thread) {
        return thread.stackTrace;
      }
    }
    return [];
  };

  private static getThreadLabel = (count: number): string => (count === 1 ? 'thread' : 'threads');

  private toggleExpand = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  };

  public override render(): JSX.Element {
    const { threadGroup, linesToConsider } = this.props;
    const { expanded } = this.state;

    const stackTrace = GroupDetails.getStackTrace(threadGroup);
    const sortedByName = threadGroup.sort((t1, t2) => t1.name.localeCompare(t2.name));
    const collapsable = sortedByName.length - GroupDetails.THREADS_TO_SHOW_WHEN_COLLAPSED;
    const threads = expanded
      ? sortedByName
      : sortedByName.slice(0, GroupDetails.THREADS_TO_SHOW_WHEN_COLLAPSED);

    return (
      <>
        <ul>
          {threads.map((thread) => <ThreadSummary key={thread.uniqueId} thread={thread} />)}

          {collapsable > 0
            && (
              <li>
                <Button appearance="subtle" spacing="compact" onClick={this.toggleExpand}>
                  {expanded
                    ? `Collapse thread list (hide ${collapsable} ${GroupDetails.getThreadLabel(collapsable)})`
                    : `Expand thread list (${collapsable} more ${GroupDetails.getThreadLabel(collapsable)} to show)`}
                </Button>
              </li>
            )}
        </ul>
        <StackTrace stackTrace={stackTrace} linesToConsider={linesToConsider} />
      </>
    );
  }
}
