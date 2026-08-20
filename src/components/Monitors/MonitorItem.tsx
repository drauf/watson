import Heading from '@atlaskit/heading';
import React, { type JSX } from 'react';
import Monitor from './Monitor';
import MonitorOwner from './MonitorOwner';
import WaitingList from './WaitingList';
import './MonitorItem.css';

interface Props {
  monitor: Monitor;
}

export default class MonitorItem extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { monitor } = this.props;
    const javaClass = monitor.javaClass
      ? monitor.javaClass.substring(monitor.javaClass.lastIndexOf('.') + 1)
      : 'unknown class';

    return (
      <div className="monitors-container">
        <div className="monitor-summary">
          <Heading as="h5" size="xsmall">{monitor.time}</Heading>
          {javaClass}
        </div>
        <div className="monitor-details">
          <MonitorOwner monitor={monitor} />
          <WaitingList waiting={monitor.waiting} />
        </div>
      </div>
    );
  }
}
