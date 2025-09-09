import React from 'react';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupDetails from './GroupDetails';

type Props = {
  threadGroup: Thread[];
  maxDifferingLines: number;
};

export default class StuckThreadsGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element | null {
    const { threadGroup, maxDifferingLines } = this.props;

    if (threadGroup.length === 0) {
      return null;
    }

    const thread = threadGroup[0];
    const header = (
      <>
        {threadGroup.length}
        {' '}
        similar stack(s) for
        {' '}
        &quot;
        {thread.name}
        &quot;
      </>
    );
    const content = <GroupDetails threadGroup={threadGroup} maxDifferingLines={maxDifferingLines} />;

    return <CollapsableGroup header={header} content={content} />;
  }
}
