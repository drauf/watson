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

  public state: State = {
    showDetails: true,
  };

  public render() {
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
