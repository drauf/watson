import React from 'react';
import { SimilarStacksFilter } from './SimilarStacksPage';

type SimilarStacksSettingsProps = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
  onFilterChange: (filter: number) => React.MouseEventHandler<HTMLAnchorElement>;
  onSettingsChange: React.ChangeEventHandler<HTMLInputElement>;
};

const SimilarStacksSettings: React.SFC<SimilarStacksSettingsProps> =
  ({ linesToConsider, minimalGroupSize, withoutIdle, onFilterChange, onSettingsChange }) => (
    <div id="similar-stacks-settings">
      <div className="filters">
        <b>Filters:</b>

        <a
          className={withoutIdle ? 'checked' : ''}
          onClick={onFilterChange(SimilarStacksFilter.WithoutIdle)}>
          Without Idle
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
