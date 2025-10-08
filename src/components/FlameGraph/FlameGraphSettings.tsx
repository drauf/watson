import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  withoutIdle: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class FlameGraphSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      withoutIdle,
      usingCpu,
      nameFilter,
      stackFilter,
      onFilterChange,
      onRegExpChange,
    } = this.props;

    return (
      <section id="heading">
        <section id="settings">
          <div className="filters">
            <b>Filters:</b>

            <Filter
              name="withoutIdle"
              displayName="Active"
              checked={withoutIdle}
              onChange={onFilterChange}
              tooltip="Hide threads waiting for I/O or in thread pools"
            />

            <Filter
              name="usingCpu"
              displayName="High CPU usage"
              checked={usingCpu}
              onChange={onFilterChange}
              tooltip="Show only threads using more than 30% CPU - focuses on actual performance hotspots"
            />
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
        </section>
      </section>
    );
  }
}
