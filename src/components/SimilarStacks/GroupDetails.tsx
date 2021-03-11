import React from 'react';
import Thread from '../../types/Thread';
import StackTrace from './StackTrace';
import ThreadSummary from './ThreadSummary';

type Props = {
  threadGroup: Thread[];
  linesToConsider: number;
};

type State = {
  expanded: boolean;
};

export default class GroupDetails extends React.PureComponent<Props, State> {
  private static THREADS_TO_SHOW_WHEN_COLLAPSED = 20;

  constructor(props: Props) {
    super(props);
    this.state = { expanded: false };
  }

  private toggleExpand = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  }

  private getStackTrace = (threads: Thread[]): string[] => {
    for (const thread of threads) {
      if (thread) {
        return thread.stackTrace;
      }
    }
    return [];
  }

  public render(): JSX.Element {
    const { threadGroup, linesToConsider } = this.props;
    const { expanded } = this.state;

    const stackTrace = this.getStackTrace(threadGroup);
    const sortedByName = threadGroup.sort((t1, t2) => t1.name.localeCompare(t2.name));
    const collapsable = sortedByName.length - GroupDetails.THREADS_TO_SHOW_WHEN_COLLAPSED;
    const threads = expanded
      ? sortedByName
      : sortedByName.slice(0, GroupDetails.THREADS_TO_SHOW_WHEN_COLLAPSED);

    return (
      <>
        <ul>
          {threads.map((thread) => <ThreadSummary key={thread.id} thread={thread} />)}

          {collapsable > 0
            && (
              <li>
                <button type="button" onClick={this.toggleExpand}>
                  {expanded
                    ? `Collapse threads list (hide ${collapsable} thread(s))`
                    : `Expand threads list (${collapsable} more thread(s) to show)`}
                </button>
              </li>
            )}
        </ul>
        <StackTrace stackTrace={stackTrace} linesToConsider={linesToConsider} />
      </>
    );
  }
}
