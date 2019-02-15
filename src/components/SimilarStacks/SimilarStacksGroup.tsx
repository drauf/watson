import React from 'react';
import Thread from '../../types/Thread';
import StackTrace from './StackTrace';
import ThreadSummary from './ThreadSummary';

type SimilarStacksGroupProps = {
  threadGroup: Thread[];
  linesToConsider: number;
  minimalGroupSize: number;
};

type SimilarStacksGroupState = {
  collapse: boolean;
};

export default class SimilarStacksGroup
  extends React.PureComponent<SimilarStacksGroupProps, SimilarStacksGroupState> {

  public state: SimilarStacksGroupState = {
    collapse: true,
  };

  public render() {
    if (this.props.minimalGroupSize > this.props.threadGroup.length) {
      return null;
    }

    const sortedByName = this.props.threadGroup.sort((t1, t2) => t1.name.localeCompare(t2.name));
    const stackTrace = this.getStackTrace(this.props.threadGroup);
    const threads = this.state.collapse ? sortedByName.slice(0, 20) : sortedByName;

    return (
      <>
        <h6>{this.props.threadGroup.length} thread(s) with this stack:</h6>
        <ul>
          {threads.map((thread, index) => <ThreadSummary key={index} thread={thread} />)}
          {sortedByName.length > 20 &&
            <li><a onClick={this.toggleCollapse}>
              {this.state.collapse
                ? `Expand threads list (${sortedByName.length - 20} more thread(s) to show)`
                : `Collapse threads list (hide ${sortedByName.length - 20} thread(s))`}
            </a></li>}
        </ul>
        <StackTrace stackTrace={stackTrace} linesToConsider={this.props.linesToConsider} />
      </>
    );
  }

  private toggleCollapse = () => {
    this.setState(prevState => ({ collapse: !prevState.collapse }));
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
