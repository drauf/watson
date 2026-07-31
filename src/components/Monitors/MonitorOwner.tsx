import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import Monitor from './Monitor';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  monitor: Monitor;
}

export default class MonitorOwner extends React.PureComponent<Props> {
  public override render(): JSX.Element | null {
    const { monitor } = this.props;

    if (!monitor.owner) {
      return null;
    }

    return (
      <Text as="p">
        <Text as="strong" weight="bold">Held by:</Text>
        <br />
        <OpenThreadDetailsButton text={monitor.owner.name} thread={monitor.owner} />
        <br />
      </Text>
    );
  }
}
