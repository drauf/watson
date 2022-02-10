import React from 'react';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupDetails from './GroupDetails';

type Props = {
  threadGroup: Thread[];
  linesToConsider: number;
};

export default class SimilarStacksGroup extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { threadGroup, linesToConsider } = this.props;

    const header = (
      <>
        {threadGroup.length}
        {' '}
        thread(s) with this stack:
      </>
    );
    const content = <GroupDetails threadGroup={threadGroup} linesToConsider={linesToConsider} />;

    return <CollapsableGroup header={header} content={content} />;
  }
}
