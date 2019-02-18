import React from 'react';
import Filter from '../Filter/Filter';

type SimilarStacksSettingsProps = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onSettingsChange: React.ChangeEventHandler<HTMLInputElement>;
};

const SimilarStacksSettings: React.SFC<SimilarStacksSettingsProps> =
  ({ linesToConsider, minimalGroupSize, withoutIdle, onFilterChange, onSettingsChange }) => (
    <div id="similar-stacks-settings">
      <div className="filters">
        <b>Filters:</b>

        <Filter name="withoutIdle" displayName="Without Idle"
          checked={withoutIdle} onChange={onFilterChange} />
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
