import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
};

const MonitorsSettings: React.FunctionComponent<Props> = ({
  withOwner, withoutIdle, withoutOwner, onFilterChange,
}) => (
  <section id="settings">
    <div className="filters">
      <b>Filters:</b>

      <Filter
        name="withoutIdle"
        displayName="Without Idle"
        checked={withoutIdle}
        onChange={onFilterChange}
      />

      <Filter
        name="withOwner"
        displayName="With Owner"
        checked={withOwner}
        onChange={onFilterChange}
      />

      <Filter
        name="withoutOwner"
        displayName="Without Owner"
        checked={withoutOwner}
        onChange={onFilterChange}
      />
    </div>
  </section>
);

export default MonitorsSettings;
