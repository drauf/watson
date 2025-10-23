import React from 'react';
import Monitor from './Monitor';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

type Props = {
  monitor: Monitor;
};

export default class MonitorOwner extends React.PureComponent<Props> {
  public override render(): JSX.Element | null {
    const { monitor } = this.props;

    if (!monitor.owner) {
      return null;
    }

    return (
      <p>
        <b>Held by:</b>
        <br />
        <OpenThreadDetailsButton text={monitor.owner.name} className="monitor-owner" thread={monitor.owner} />
        <br />
      </p>
    );
  }
}
