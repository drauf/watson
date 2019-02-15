import React from 'react';
import { CpuConsumersMode } from './CpuConsumersPage';

type CpuConsumersSettingsProps = {
  mode: CpuConsumersMode;
  limit: number;
  onModeChange: (mode: number) => React.MouseEventHandler<HTMLAnchorElement>;
  onLimitChange: React.ChangeEventHandler<HTMLInputElement>;
};

const CpuConsumersSettings: React.SFC<CpuConsumersSettingsProps> =
  ({ mode, limit, onModeChange, onLimitChange }) => (
    <div id="cpu-consumers-settings">
      <div className="filters">
        <b>CPU usage calculation:</b>

        <a
          className={mode === CpuConsumersMode.Mean ? 'checked' : ''}
          onClick={onModeChange(CpuConsumersMode.Mean)}>
          Mean
        </a>

        <a
          className={mode === CpuConsumersMode.Median ? 'checked' : ''}
          onClick={onModeChange(CpuConsumersMode.Median)}>
          Median
        </a>

        <a
          className={mode === CpuConsumersMode.Max ? 'checked' : ''}
          onClick={onModeChange(CpuConsumersMode.Max)}>
          Max
        </a>
      </div>

      <div id="cpu-consumers-limit">
        <label>
          <input type="number" name="threadsLimit" min="0" max="10000"
            value={limit}
            onChange={onLimitChange}
          />
          <b>Threads to show</b>
        </label>
      </div>
    </div>
  );

export default CpuConsumersSettings;
