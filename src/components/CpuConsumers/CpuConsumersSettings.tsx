import React from 'react';
import CpuConsumersMode from './CpuConsumersMode';
import RegexFilters from '../common/RegexFilters';

interface Props {
  mode: CpuConsumersMode;
  nameFilter: string;
  stackFilter: string;
  onModeChange: (mode: number) => React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class CpuConsumersSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      mode, nameFilter, stackFilter, onModeChange, onRegExpChange,
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

        <div className="settings-row">
          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />
        </div>
      </section>
    );
  }
}
