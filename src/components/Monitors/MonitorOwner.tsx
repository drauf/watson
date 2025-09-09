import React from 'react';
import ThreadDetails from '../ThreadDetails/ThreadDetails';
import Monitor from './Monitor';

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
      <>
        <b>Held by:</b>
        <br />
        <ThreadDetails text={monitor.owner.name} className="monitor-owner" thread={monitor.owner} />
        <br />
      </>
    );
  }
}
