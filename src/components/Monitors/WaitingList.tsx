import React from 'react';
import Thread from '../../types/Thread';
import WaitingListItem from './WaitingListItem';

type WaitingListProps = {
  waiting: Thread[],
};

type WaitingListState = {
  expanded: boolean;
};

export default class WaitingList extends React.PureComponent<WaitingListProps, WaitingListState> {

  private static THREADS_TO_SHOW_WHEN_COLLAPSED = 20;

  public state: WaitingListState = {
    expanded: false,
  };

  public render() {
    if (this.props.waiting.length === 0) {
      return null;
    }

    const collapsable = this.props.waiting.length - WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED;
    const threads = this.state.expanded
      ? this.props.waiting
      : this.props.waiting.slice(0, WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED);

    return (
      <>
        <b>{this.props.waiting.length} thread(s) waiting for notification on lock:</b>
        <br />

        {threads.map((thread, index) => <WaitingListItem thread={thread} key={index} />)}

        {collapsable > 0 &&
          <a onClick={this.toggleExpand}>
            {this.state.expanded
              ? `Collapse threads list (hide ${collapsable} thread(s))`
              : `Expand threads list (${collapsable} more thread(s) to show)`}
          </a>}
      </>
    );
  }

  private toggleExpand = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  }
}
