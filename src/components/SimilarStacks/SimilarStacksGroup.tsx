import React from 'react';
import Thread from '../../types/Thread';
import GroupDetails from './GroupDetails';

type Props = {
  threadGroup: Thread[];
  linesToConsider: number;
};

type State = {
  showDetails: boolean;
};

export default class SimilarStacksGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: true };
  }

  private toggleGroup = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  }

  public render(): JSX.Element {
    const { threadGroup, linesToConsider } = this.props;
    const { showDetails } = this.state;

    return (
      <>
        <h5 className="clickable ellipsis" onClick={this.toggleGroup}>
          <span className={showDetails ? 'chevron' : 'chevron rotate'} />
          {threadGroup.length}
          {' '}
          thread(s) with this stack:
        </h5>

        {showDetails && (
          <GroupDetails
            threadGroup={threadGroup}
            linesToConsider={linesToConsider}
          />
        )}
      </>
    );
  }
}
