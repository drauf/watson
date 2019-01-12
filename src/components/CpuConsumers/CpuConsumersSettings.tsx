import * as React from 'react';
import { CpuConsumersMode } from './CpuConsumers';
import './CpuConsumersSettings.css';

interface CpuConsumersSettingsProps {
  mode: CpuConsumersMode;
  limit: number;
  onModeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLimitChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CpuConsumersSettings: React.SFC<CpuConsumersSettingsProps> = ({ mode, limit, onModeChange, onLimitChange }) => (
  <div className="cpu-consumers-settings">
    <div className="cpu-consumers-mode">
      <b>CPU usage calculation mode:</b>
      <label>
        <input
          type="radio"
          name="mode"
          value="0"
          checked={mode === CpuConsumersMode.Mean}
          onChange={onModeChange}
        />
        Mean
      </label>

      <label>
        <input
          type="radio"
          name="mode"
          value="1"
          checked={mode === CpuConsumersMode.Median}
          onChange={onModeChange}
        />
        Median
      </label>

      <label>
        <input
          type="radio"
          name="mode"
          value="2"
          checked={mode === CpuConsumersMode.Max}
          onChange={onModeChange}
        />
        Max
      </label>
    </div>

    <div className="cpu-consumers-limit">
      <label>
        <input
          type="number"
          name="threadsLimit"
          value={limit}
          min="0"
          onChange={onLimitChange}
        />
        <b><i>#</i> of threads to show</b>
      </label>
    </div>
  </div>
)

export default CpuConsumersSettings;
