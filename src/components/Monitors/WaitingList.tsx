import React from 'react';
import Thread from '../../types/Thread';
import WaitingListItem from './WaitingListItem';

type Props = {
  waiting: Thread[],
};

type State = {
  expanded: boolean;
};

export default class WaitingList extends React.PureComponent<Props, State> {
  private static THREADS_TO_SHOW_WHEN_COLLAPSED = 20;

  constructor(props: Props) {
    super(props);
    this.state = { expanded: false };
  }

  private toggleExpand = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  }

  public render() {
    const { waiting } = this.props;
    const { expanded } = this.state;

    if (waiting.length === 0) {
      return null;
    }

    const collapsable = waiting.length - WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED;
    const threads = expanded ? waiting : waiting.slice(0, WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED);

    return (
      <>
        <b>
          {waiting.length}
          {' '}
          thread(s) waiting for notification on lock:
        </b>
        <br />

        {threads.map((thread) => <WaitingListItem thread={thread} key={thread.id} />)}

        {collapsable > 0
          && (
            <button type="button" onClick={this.toggleExpand}>
              {expanded
                ? `Collapse threads list (hide ${collapsable} thread(s))`
                : `Expand threads list (${collapsable} more thread(s) to show)`}
            </button>
          )}
      </>
    );
  }
}
