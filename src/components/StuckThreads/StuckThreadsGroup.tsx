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

  public state: State = {
    showDetails: true,
  };

  public render() {
    if (this.props.threadGroup.length === 0) {
      return null;
    }

    const thread = this.props.threadGroup[0];
    return (
      <>
        <h5 className="clickable ellipsis" onClick={this.toggleGroup}>
          <span className={this.state.showDetails ? 'chevron' : 'chevron rotate'} />
          {this.props.threadGroup.length} similar stack(s) for "{thread.name}"
        </h5>

        {this.state.showDetails &&
          <GroupDetails
            threadGroup={this.props.threadGroup}
            maxDifferingLines={this.props.maxDifferingLines} />}
      </>
    );
  }

  private toggleGroup = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }
}
