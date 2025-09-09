import React from 'react';
import CollapsableGroup from '../CollapsableGroup';
import MonitorItem from './MonitorItem';
import MonitorOverTime from './MonitorOverTime';

type Props = {
  monitor: MonitorOverTime;
};

export default class MonitorOverTimeGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { monitor } = this.props;

    const header = (
      <>
        {monitor.waitingSum}
        {' '}
        thread(s) waiting for &lt;
        {monitor.id}
        &gt;
      </>
    );
    const content = (monitor.monitors.map((item) => <MonitorItem key={item.uniqueId} monitor={item} />));

    return <CollapsableGroup header={header} content={content} />;
  }
}
