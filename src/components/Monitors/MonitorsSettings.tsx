import React from 'react';
import { MonitorsFilter } from './MonitorsPage';

type CpuConsumersSettingsProps = {
  filter: MonitorsFilter;
  onFilterChange: (filter: number) => React.ChangeEventHandler<HTMLInputElement>;
};

const MonitorsSettings: React.SFC<CpuConsumersSettingsProps> =
  ({ filter, onFilterChange }) => (
    <div id="monitors-settings">
      <b>Filter:</b>
      <label className={filter === MonitorsFilter.None ? 'checked' : ''}>
        <input type="radio" name="mode"
          checked={filter === MonitorsFilter.None}
          onChange={onFilterChange(MonitorsFilter.None)}
        />
        None
      </label>

      <label className={filter === MonitorsFilter.WithOwner ? 'checked' : ''}>
        <input type="radio" name="mode"
          checked={filter === MonitorsFilter.WithOwner}
          onChange={onFilterChange(MonitorsFilter.WithOwner)}
        />
        With Owner
      </label>

      <label className={filter === MonitorsFilter.WithoutOwner ? 'checked' : ''}>
        <input type="radio" name="mode"
          checked={filter === MonitorsFilter.WithoutOwner}
          onChange={onFilterChange(MonitorsFilter.WithoutOwner)}
        />
        Without Owner
      </label>
    </div>
  );

export default MonitorsSettings;
