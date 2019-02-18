import React from 'react';
import { MonitorsFilter } from './MonitorsPage';

type CpuConsumersSettingsProps = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  onFilterChange: (filter: number) => React.MouseEventHandler<HTMLAnchorElement>;
};

const MonitorsSettings: React.SFC<CpuConsumersSettingsProps> =
  ({ withOwner, withoutIdle, withoutOwner, onFilterChange }) => (
    <div id="monitors-settings">
      <div className="filters">
        <b>Filters:</b>

        <a
          className={withoutIdle ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.WithoutIdle)}>
          Without Idle
        </a>

        <a
          className={withOwner ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.WithOwner)}>
          With Owner
        </a>

        <a
          className={withoutOwner ? 'checked' : ''}
          onClick={onFilterChange(MonitorsFilter.WithoutOwner)}>
          Without Owner
        </a>
      </div>
    </div>
  );

export default MonitorsSettings;
