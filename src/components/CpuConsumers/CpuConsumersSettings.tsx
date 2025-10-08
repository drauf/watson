import React from 'react';
import CpuConsumersMode from './CpuConsumersMode';

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

        <div>
          <label title="Filter threads by name using regular expressions. Examples: 'http.*exec' matches Tomcat threads, '^main' matches only the main thread">
            <b>Thread name pattern</b>
            <input
              type="text"
              name="nameFilter"
              value={nameFilter}
              onChange={onRegExpChange}
              placeholder="e.g. http.*exec"
            />
          </label>

          <label title="Filter threads by any line in their stack trace using regular expressions. Examples: 'java\.io' matches threads doing I/O operations, 'SQLException' finds database errors, 'com\.atlassian\.jira' finds Jira-specific code">
            <b>Stack trace pattern</b>
            <input
              type="text"
              name="stackFilter"
              value={stackFilter}
              onChange={onRegExpChange}
              placeholder="e.g. java\.io"
            />
          </label>
        </div>

        <div id="cpu-consumers-limit">
          <b>Threads to show</b>
          <label>
            <input
              type="number"
              name="limit"
              min="0"
              max="10000"
              value={limit}
              onChange={onLimitChange}
            />
          </label>
        </div>
      </section>
    );
  }
}
