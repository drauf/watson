import * as React from 'react';
import { CpuConsumersMode } from './CpuConsumers';

interface ModeSelectorProps {
  mode: CpuConsumersMode;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ModeSelector: React.SFC<ModeSelectorProps> = ({ mode, onChange }) => (
  <div>
    <label>
      <input
        type="radio"
        name="mode"
        value="0"
        checked={mode === CpuConsumersMode.Mean}
        onChange={onChange}
      />
      Mean
  </label>

    <label>
      <input
        type="radio"
        name="mode"
        value="1"
        checked={mode === CpuConsumersMode.Median}
        onChange={onChange}
      />
      Median
  </label>

    <label>
      <input
        type="radio"
        name="mode"
        value="2"
        checked={mode === CpuConsumersMode.Max}
        onChange={onChange}
      />
      Max
  </label>
  </div>
)

export default ModeSelector;
