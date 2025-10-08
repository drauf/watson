import React from 'react';
import Filter from '../Filter/Filter';
import RegexFilters from '../common/RegexFilters';

type Props = {
  withoutIdle: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class FlameGraphSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      withoutIdle,
      usingCpu,
      nameFilter,
      stackFilter,
      onFilterChange,
      onRegExpChange,
    } = this.props;

    return (
      <section id="heading">
        <section id="settings">
          <div className="filters">
            <b>Filters:</b>

            <Filter
              name="withoutIdle"
              displayName="Active"
              checked={withoutIdle}
              onChange={onFilterChange}
              tooltip="Hide threads waiting for I/O or in thread pools"
            />

            <Filter
              name="usingCpu"
              displayName="High CPU usage"
              checked={usingCpu}
              onChange={onFilterChange}
              tooltip="Show only threads using more than 10% CPU - focuses on actual performance hotspots"
            />
          </div>

          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />
        </section>
      </section>
    );
  }
}
