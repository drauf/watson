import Lozenge from '@atlaskit/lozenge/new';
import React, { type JSX } from 'react';
import getRepresentativeStackLine from '../../common/getRepresentativeStackLine';
import {
  getThreadGroupLabels,
  getThreadLabelAppearance,
  getThreadLabelDisplayName,
} from '../../common/threadLabels';
import Thread from '../../types/Thread';
import CollapsableGroup from '../CollapsableGroup';
import GroupHeader from '../common/GroupHeader';
import GroupDetails from './GroupDetails';

interface Props {
  threadGroup: Thread[];
  linesToConsider: number;
}
export default class SimilarStacksGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { linesToConsider, threadGroup } = this.props;
    const labels = getThreadGroupLabels(threadGroup);

    const header = (
      <GroupHeader
        leading={<Lozenge appearance="neutral" trailingMetric={threadGroup.length.toString()}>Threads</Lozenge>}
        title={getRepresentativeStackLine(threadGroup)}
        metadata={labels.map((label) => (
          <Lozenge key={label} appearance={getThreadLabelAppearance(label)}>{getThreadLabelDisplayName(label)}</Lozenge>
        ))}
      />
    );

    return (
      <CollapsableGroup
        header={header}
        content={<GroupDetails threadGroup={threadGroup} linesToConsider={linesToConsider} />}
      />
    );
  }
}
