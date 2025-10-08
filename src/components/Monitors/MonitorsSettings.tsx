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
            displayName="Without Idle"
            checked={withoutIdle}
            onChange={onFilterChange}
          />

          <Filter
            name="withOwner"
            displayName="With Owner"
            checked={withOwner}
            onChange={onFilterChange}
          />

          <Filter
            name="withoutOwner"
            displayName="Without Owner"
            checked={withoutOwner}
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
              title="Filter monitors by thread name using regular expressions. Shows monitors where any waiting or owning thread matches. Examples: 'http.*exec' matches Tomcat threads, '^main
}
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
              title="Filter monitors by stack trace using regular expressions. Shows monitors where any waiting or owning thread has a matching stack trace. Examples: 'java\.io' matches threads doing I/O operations, 'com\.atlassian\.jira' finds Jira-specific code"
            />
            <b>Stack trace RegExp</b>
          </label>
        </div>
      </section>
    );
  }
}
