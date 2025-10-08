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
      <section id="flame-graph-settings">
        <div className="filters">
          <b>Filters:</b>

          <Filter
            name="withoutIdle"
            displayName="Without Idle"
            checked={withoutIdle}
            onChange={onFilterChange}
          />

          <Filter
            name="usingCpu"
            displayName="Using >30% CPU"
            checked={usingCpu}
            onChange={onFilterChange}
          />
        </div>

        <div id="regexp-filters">
          <label>
            <input
              type="text"
              name="nameFilter"
              value={nameFilter}
              onChange={onRegExpChange}
              title="Filter threads by name using regular expressions. Examples: 'http.*exec' matches Tomcat threads, '^main
 matches only the main thread"
            />
            <b>Thread name RegExp</b>
          </label>

          <label>
            <input
              type="text"
              name="stackFilter"
              value={stackFilter}
              onChange={onRegExpChange}
              title="Filter threads by any line in their stack trace using regular expressions. Examples: 'java\.io' matches threads doing I/O operations, 'SQLException' finds database errors, 'com\.atlassian\.jira' finds Jira-specific code"
            />
            <b>Stack trace RegExp</b>
          </label>
        </div>
      </section>
    );
  }
}
