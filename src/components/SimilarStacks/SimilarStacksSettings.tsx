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
        <b><i>#</i> of stack trace lines to compare</b>
      </label>

      <label>
        <input
          type="number"
          name="minimalGroupSize"
          value={minimalGroupSize}
          onChange={onSettingsChange}
        />
        <b>Minimal size of the group to be shown</b>
      </label>
    </div>
  );

export default SimilarStacksSettings;
