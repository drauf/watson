import React from 'react';
import Thread from '../../types/Thread';
import GroupDetails from './GroupDetails';

type SimilarStacksGroupProps = {
  threadGroup: Thread[];
  linesToConsider: number;
  minimalGroupSize: number;
};

type SimilarStacksGroupState = {
  showDetails: boolean;
};

export default class SimilarStacksGroup
  extends React.PureComponent<SimilarStacksGroupProps, SimilarStacksGroupState> {

  public state: SimilarStacksGroupState = {
    showDetails: true,
  };

  public render() {
    if (this.props.minimalGroupSize > this.props.threadGroup.length) {
      return null;
    }

    return (
      <>
        <h6 className="clickable" onClick={this.toggleGroup}>
          <span className={this.state.showDetails ? 'chevron' : 'chevron rotate'} />
          {this.props.threadGroup.length} thread(s) with this stack:
        </h6>

        {this.state.showDetails &&
          <GroupDetails
            threadGroup={this.props.threadGroup}
            linesToConsider={this.props.linesToConsider} />}
      </>
    );
  }

  private toggleGroup = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }
}
