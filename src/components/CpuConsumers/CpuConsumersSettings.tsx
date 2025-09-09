import React from 'react';
import CpuConsumersMode from './CpuConsumersMode';

type Props = {
  mode: CpuConsumersMode;
  limit: number;
  onModeChange: (mode: number) => React.ChangeEventHandler<HTMLInputElement>;
  onLimitChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class CpuConsumersSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      mode, limit, onModeChange, onLimitChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
          <b>CPU usage calculation:</b>

          <label className={mode === CpuConsumersMode.Mean ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersMode.Mean}
              onChange={onModeChange(CpuConsumersMode.Mean)}
            />
            Mean
          </label>

          <label className={mode === CpuConsumersMode.Median ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersMode.Median}
              onChange={onModeChange(CpuConsumersMode.Median)}
            />
            Median
          </label>

          <label className={mode === CpuConsumersMode.Max ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersMode.Max}
              onChange={onModeChange(CpuConsumersMode.Max)}
            />
            Max
          </label>
        </div>

        <div id="cpu-consumers-limit">
          <label>
            <input
              type="number"
              name="limit"
              min="0"
              max="10000"
              value={limit}
              onChange={onLimitChange}
            />
            <b>Threads to show</b>
          </label>
        </div>
      </section>
    );
  }
}
