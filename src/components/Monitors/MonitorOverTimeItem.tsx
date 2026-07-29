import Lozenge from '@atlaskit/lozenge/new';
import React from 'react';
import CollapsableGroup from '../CollapsableGroup';
import GroupHeader from '../common/GroupHeader';
import MonitorItem from './MonitorItem';
import MonitorOverTime from './MonitorOverTime';

interface Props {
  monitor: MonitorOverTime;
}

export default class MonitorOverTimeGroup extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { monitor } = this.props;
    const javaClass = monitor.monitors[0]?.javaClass ?? 'Unknown monitor class';

    const header = (
      <GroupHeader
        leading={(
          <>
            <Lozenge appearance="neutral" trailingMetric={monitor.waitingSum.toString()}>
              Waiting threads
            </Lozenge>
            <Lozenge appearance="neutral" trailingMetric={monitor.monitors.length.toString()}>
              Thread dumps
            </Lozenge>
          </>
        )}
        title={`${javaClass} <${monitor.id}>`}
        metadata={null}
      />
    );
    const content = (monitor.monitors.map((item) => <MonitorItem key={item.uniqueId} monitor={item} />));

    return <CollapsableGroup initiallyCollapsed header={header} content={content} />;
  }
}
