import React from 'react';
import Thread from '../../types/Thread';
import StackTrace from './StackTrace';
import ThreadSummary from './ThreadSummary';

type SimilarStacksGroupProps = {
  threadGroup: Thread[];
  linesToConsider: number;
};

type SimilarStacksGroupState = {
  collapseThreadsList: boolean;
};

export default class GroupDetails
  extends React.PureComponent<SimilarStacksGroupProps, SimilarStacksGroupState> {

  public state: SimilarStacksGroupState = {
    collapseThreadsList: true,
  };

  public render() {
    const sortedByName = this.props.threadGroup.sort((t1, t2) => t1.name.localeCompare(t2.name));
    const stackTrace = this.getStackTrace(this.props.threadGroup);
    const threads = this.state.collapseThreadsList ? sortedByName.slice(0, 20) : sortedByName;

    return (
      <>
        <ul>
          {threads.map((thread, index) => <ThreadSummary key={index} thread={thread} />)}
          {sortedByName.length > 20 &&
            <li><a onClick={this.toggleCollapseThreadsList}>
              {this.state.collapseThreadsList
                ? `Expand threads list (${sortedByName.length - 20} more thread(s) to show)`
                : `Collapse threads list (hide ${sortedByName.length - 20} thread(s))`}
            </a></li>}
        </ul>
        <StackTrace stackTrace={stackTrace} linesToConsider={this.props.linesToConsider} />
      </>
    );
  }

  private toggleCollapseThreadsList = () => {
    this.setState(prevState => ({ collapseThreadsList: !prevState.collapseThreadsList }));
  }

  private getStackTrace = (threads: Thread[]): string[] => {
    for (const thread of threads) {
      if (thread) {
        return thread.stackTrace;
      }
    }
    return [];
  }
}
