import React from 'react';

type SimilarStacksSettingsProps = {
  linesToConsider: number;
  minimalGroupSize: number;
  onSettingsChange: React.ChangeEventHandler<HTMLInputElement>;
};

const SimilarStacksSettings: React.SFC<SimilarStacksSettingsProps> =
  ({ linesToConsider, minimalGroupSize, onSettingsChange }) => (
    <div id="similar-stacks-settings">
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
