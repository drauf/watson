import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class MonitorsSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      withOwner, withoutIdle, withoutOwner, nameFilter, stackFilter, onFilterChange, onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
          <b>Filters:</b>

          <Filter
            name="withoutIdle"
            displayName="Active"
            checked={withoutIdle}
            onChange={onFilterChange}
            tooltip="Hide idle thread pool and queue monitoring patterns"
          />

          <Filter
            name="withOwner"
            displayName="Owned locks"
            checked={withOwner}
            onChange={onFilterChange}
            tooltip="Show only locks that have an owning thread - indicates active lock usage"
          />

          <Filter
            name="withoutOwner"
            displayName="Unowned locks"
            checked={withoutOwner}
            onChange={onFilterChange}
            tooltip="Show only locks without owners - potential deadlock or contention areas"
          />
        </div>

        <div>
          <label>
            <b>Thread name pattern</b>
            <input
              type="text"
              name="nameFilter"
              value={nameFilter}
              onChange={onRegExpChange}
              title="Filter monitors by thread name using regular expressions. Shows monitors where any waiting or owning thread matches. Examples: 'http.*exec' matches Tomcat threads, '^main' matches only the main thread"
              placeholder="e.g. http.*exec"
            />
          </label>

          <label>
            <b>Stack trace pattern</b>
            <input
              type="text"
              name="stackFilter"
              value={stackFilter}
              onChange={onRegExpChange}
              title="Filter monitors by stack trace using regular expressions. Shows monitors where any waiting or owning thread has a matching stack trace. Examples: 'java\.io' matches threads doing I/O operations, 'com\.atlassian\.jira' finds Jira-specific code"
              placeholder="e.g. java\.io"
            />
          </label>
        </div>
      </section>
    );
  }
}
