import React from 'react';
import { CpuConsumersMode } from './CpuConsumers';
import './CpuConsumersSettings.css';

type CpuConsumersSettingsProps = {
  mode: CpuConsumersMode;
  limit: number;
  onModeChange: (mode: number) => React.ChangeEventHandler<HTMLInputElement>;
  onLimitChange: React.ChangeEventHandler<HTMLInputElement>;
};

const CpuConsumersSettings: React.SFC<CpuConsumersSettingsProps> =
  ({ mode, limit, onModeChange, onLimitChange }) => (
    <div className="cpu-consumers-settings">
      <div className="cpu-consumers-mode">
        <b>CPU usage calculation mode:</b>
        <label>
          <input type="radio" name="mode"
            checked={mode === CpuConsumersMode.Mean}
            onChange={onModeChange(CpuConsumersMode.Mean)}
          />
          Mean
      </label>

        <label>
          <input type="radio" name="mode"
            checked={mode === CpuConsumersMode.Median}
            onChange={onModeChange(CpuConsumersMode.Median)}
          />
          Median
      </label>

        <label>
          <input type="radio" name="mode"
            checked={mode === CpuConsumersMode.Max}
            onChange={onModeChange(CpuConsumersMode.Max)}
          />
          Max
      </label>
      </div>

      <div className="cpu-consumers-limit">
        <label>
          <input type="number" name="threadsLimit" min="0" max="10000"
            value={limit}
            onChange={onLimitChange}
          />
          <b><i>#</i> of threads to show</b>
        </label>
      </div>
    </div>
  );

export default CpuConsumersSettings;
