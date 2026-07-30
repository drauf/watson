import Button from '@atlaskit/button/new';
import Text from '@atlaskit/primitives/text';
import React from 'react';
import Thread from '../../types/Thread';
import WaitingListItem from './WaitingListItem';

interface Props {
  waiting: Thread[];
}

interface State {
  expanded: boolean;
}

export default class WaitingList extends React.PureComponent<Props, State> {
  private static THREADS_TO_SHOW_WHEN_COLLAPSED = 20;

  constructor(props: Props) {
    super(props);
    this.state = { expanded: false };
  }

  private static getThreadLabel = (count: number): string => (count === 1 ? 'thread' : 'threads');

  private toggleExpand = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  };

  public override render(): JSX.Element | null {
    const { waiting } = this.props;
    const { expanded } = this.state;

    if (waiting.length === 0) {
      return null;
    }

    const collapsable = waiting.length - WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED;
    const threads = expanded ? waiting : waiting.slice(0, WaitingList.THREADS_TO_SHOW_WHEN_COLLAPSED);

    return (
      <section className="waiting-list">
        <Text as="strong" weight="bold">
          {waiting.length}
          {' '}
          {WaitingList.getThreadLabel(waiting.length)}
          {' '}
          waiting for notification on lock:
        </Text>

        <ul className="waiting-list-items">
          {threads.map((thread) => <WaitingListItem key={thread.uniqueId} thread={thread} />)}
        </ul>

        {collapsable > 0
          && (
            <Button appearance="default" onClick={this.toggleExpand}>
              {expanded
                ? `Collapse thread list (hide ${collapsable} ${WaitingList.getThreadLabel(collapsable)})`
                : `Expand thread list (${collapsable} more ${WaitingList.getThreadLabel(collapsable)} to show)`}
            </Button>
          )}
      </section>
    );
  }
}
