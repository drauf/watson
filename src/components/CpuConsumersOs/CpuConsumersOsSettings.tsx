import React from 'react';
import CpuConsumersOsMode from './CpuConsumersOsMode';

type Props = {
  mode: CpuConsumersOsMode;
  limit: number;
  onModeChange: (mode: number) => React.ChangeEventHandler<HTMLInputElement>;
  onLimitChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class CpuConsumersOsSettings extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const {
      mode, limit, onModeChange, onLimitChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
          <b>CPU usage calculation:</b>

          <label className={mode === CpuConsumersOsMode.Mean ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersOsMode.Mean}
              onChange={onModeChange(CpuConsumersOsMode.Mean)}
            />
            Mean
          </label>

          <label className={mode === CpuConsumersOsMode.Median ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersOsMode.Median}
              onChange={onModeChange(CpuConsumersOsMode.Median)}
            />
            Median
          </label>

          <label className={mode === CpuConsumersOsMode.Max ? 'checked' : ''}>
            <input
              type="checkbox"
              checked={mode === CpuConsumersOsMode.Max}
              onChange={onModeChange(CpuConsumersOsMode.Max)}
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
