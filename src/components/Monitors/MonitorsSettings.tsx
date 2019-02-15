import React from 'react';
import { MonitorsFilter } from './MonitorsPage';

type CpuConsumersSettingsProps = {
  filter: MonitorsFilter;
  onFilterChange: (filter: number) => React.MouseEventHandler<HTMLAnchorElement>;
};

const MonitorsSettings: React.SFC<CpuConsumersSettingsProps> =
  ({ filter, onFilterChange }) => (
    <div id="monitors-settings">
      <div className="filters">
        <b>Filter:</b>

        <a
          className={filter === MonitorsFilter.None ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.None)}>
          None
        </a>

        <a
          className={filter === MonitorsFilter.WithOwner ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.WithOwner)}>
          With Owner
        </a>

        <a
          className={filter === MonitorsFilter.WithoutOwner ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.WithoutOwner)}>
          Without Owner
        </a>
      </div>
    </div>
  );

export default MonitorsSettings;
