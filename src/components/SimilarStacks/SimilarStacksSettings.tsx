import React from 'react';
import { SimilarStacksFilter } from './SimilarStacksPage';

type SimilarStacksSettingsProps = {
  filter: SimilarStacksFilter;
  linesToConsider: number;
  minimalGroupSize: number;
  onFilterChange: (filter: number) => React.MouseEventHandler<HTMLAnchorElement>;
  onSettingsChange: React.ChangeEventHandler<HTMLInputElement>;
};

const SimilarStacksSettings: React.SFC<SimilarStacksSettingsProps> =
  ({ filter, linesToConsider, minimalGroupSize, onFilterChange, onSettingsChange }) => (
    <div id="similar-stacks-settings">
      <div className="filters">
        <b>Filter:</b>

        <a
          className={filter === SimilarStacksFilter.HideQueues ? 'checked' : ''}
          onClick={onFilterChange(SimilarStacksFilter.HideQueues)}>
          Hide Queues
        </a>

        <a
          className={filter === SimilarStacksFilter.All ? 'checked' : ''}
          onClick={onFilterChange(SimilarStacksFilter.All)}>
          Show All
        </a>
      </div>

      <label>
        <input
          type="number"
          name="linesToConsider"
          value={linesToConsider}
          onChange={onSettingsChange}
        />
        <b>Stack trace lines to compare</b>
      </label>

      <label>
        <input
          type="number"
          name="minimalGroupSize"
          value={minimalGroupSize}
          onChange={onSettingsChange}
        />
        <b>Minimal group size to show</b>
      </label>
    </div>
  );

export default SimilarStacksSettings;
