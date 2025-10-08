import React from 'react';
import CpuConsumersMode from './CpuConsumersMode';
import SmartTooltip from '../common/SmartTooltip';
import RegexFilters from '../common/RegexFilters';

type Props = {
  mode: CpuConsumersMode;
  limit: number;
  nameFilter: string;
  stackFilter: string;
  onModeChange: (mode: number) => React.ChangeEventHandler<HTMLInputElement>;
  onLimitChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class CpuConsumersSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      mode, limit, nameFilter, stackFilter, onModeChange, onLimitChange, onRegExpChange,
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

        <RegexFilters
          nameFilter={nameFilter}
          stackFilter={stackFilter}
          onRegExpChange={onRegExpChange}
        />

        <div id="cpu-consumers-limit">
          <SmartTooltip tooltip={(
            <div>
              <div><strong>Maximum threads to display</strong></div>
              <div>Higher values show more threads but may impact performance</div>
            </div>
          )}
          >
            <label>
              <b>Threads to display</b>
              <input
                type="number"
                name="limit"
                min="0"
                max="10000"
                value={limit}
                onChange={onLimitChange}
              />
            </label>
          </SmartTooltip>
        </div>
      </section>
    );
  }
}
