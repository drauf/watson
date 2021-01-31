import React from 'react';
import Thread from '../../types/Thread';
import GroupDetails from './GroupDetails';

type Props = {
  threadGroup: Thread[];
  maxDifferingLines: number;
};

type State = {
  showDetails: boolean;
};

export default class StuckThreadsGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: true };
  }

  private toggleGroup = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  }

  public render() {
    const { threadGroup, maxDifferingLines } = this.props;
    const { showDetails } = this.state;

    if (threadGroup.length === 0) {
      return null;
    }

    const thread = threadGroup[0];
    return (
      <>
        <h5 className="clickable ellipsis" onClick={this.toggleGroup}>
          <span className={showDetails ? 'chevron' : 'chevron rotate'} />
          {threadGroup.length}
          {' '}
          similar stack(s) for
          {' '}
          &quot;
          {thread.name}
          &quot;
        </h5>

        {showDetails && (
          <GroupDetails
            threadGroup={threadGroup}
            maxDifferingLines={maxDifferingLines}
          />
        )}
      </>
    );
  }
}
