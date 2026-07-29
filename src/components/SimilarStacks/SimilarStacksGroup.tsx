import Lozenge from '@atlaskit/lozenge/new';
import React from 'react';
import { getRepresentativeStackLine, getStackCategories } from '../../common/stackCategories';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupHeader from '../common/GroupHeader';
import GroupDetails from './GroupDetails';

interface Props {
  threadGroup: Thread[];
  linesToConsider: number;
}

const getCategoryAppearance = () => 'accent-yellow' as const;

export default class SimilarStacksGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { linesToConsider, threadGroup } = this.props;
    const categories = getStackCategories(threadGroup);

    const header = (
      <GroupHeader
        leading={<Lozenge appearance="neutral" trailingMetric={threadGroup.length.toString()}>Threads</Lozenge>}
        title={getRepresentativeStackLine(threadGroup)}
        metadata={categories.map((category) => (
          <Lozenge key={category} appearance={getCategoryAppearance()}>{category}</Lozenge>
        ))}
      />
    );

    return (
      <CollapsableGroup
        initiallyCollapsed
        header={header}
        content={<GroupDetails threadGroup={threadGroup} linesToConsider={linesToConsider} />}
      />
    );
  }
}
