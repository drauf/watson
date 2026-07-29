import Lozenge from '@atlaskit/lozenge/new';
import React from 'react';
import { getRepresentativeStackLine, getStackCategories } from '../../common/stackCategories';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupHeader from '../common/GroupHeader';
import GroupDetails from './GroupDetails';

interface Props {
  threadGroup: Thread[];
  maxDifferingLines: number;
}

const getCategoryAppearance = () => 'accent-yellow' as const;

export default class StuckThreadsGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element | null {
    const { maxDifferingLines, threadGroup } = this.props;

    if (threadGroup.length === 0) {
      return null;
    }

    const categories = getStackCategories(threadGroup);

    const header = (
      <GroupHeader
        leading={<Lozenge appearance="neutral" trailingMetric={threadGroup.length.toString()}>Stuck threads</Lozenge>}
        title={getRepresentativeStackLine(threadGroup)}
        metadata={categories.map((category) => (
          <Lozenge key={category} appearance={getCategoryAppearance()}>{category}</Lozenge>
        ))}
      />
    );

    return (
      <CollapsableGroup
        header={header}
        content={<GroupDetails threadGroup={threadGroup} maxDifferingLines={maxDifferingLines} />}
      />
    );
  }
}
