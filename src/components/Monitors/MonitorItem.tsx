import Heading from '@atlaskit/heading';
import React from 'react';
import Monitor from './Monitor';
import MonitorOwner from './MonitorOwner';
import WaitingList from './WaitingList';

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
        <div className="left">
          <Heading as="h5" size="xsmall">{monitor.time}</Heading>
          {javaClass}
        </div>
        <div>
          <MonitorOwner monitor={monitor} />
          <WaitingList waiting={monitor.waiting} />
        </div>
      </div>
    );
  }
}
