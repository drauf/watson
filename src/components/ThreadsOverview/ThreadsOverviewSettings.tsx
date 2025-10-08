import React from 'react';
import Filter from '../Filter/Filter';
import RegexFilters from '../common/RegexFilters';

type Props = {
  active: boolean;
  nonJvm: boolean;
  tomcat: boolean;
  nonTomcat: boolean;
  database: boolean;
  lucene: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class ThreadsOverviewSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      active,
      nonJvm,
      tomcat,
      nonTomcat,
      database,
      lucene,
      usingCpu,
      nameFilter,
      stackFilter,
      onFilterChange,
      onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
          <b>Filters:</b>

          <Filter
            name="active"
            displayName="Active"
            checked={active}
            onChange={onFilterChange}
            tooltip="Show only threads that changed state between dumps or are experiencing contention"
          />

          <Filter
            name="nonJvm"
            displayName="Non-JVM"
            checked={nonJvm}
            onChange={onFilterChange}
            tooltip="Hide JVM housekeeping threads (GC, compiler, etc.)"
          />

          <Filter
            name="tomcat"
            displayName="Tomcat"
            checked={tomcat}
            onChange={onFilterChange}
            tooltip="Show only HTTP request processing threads"
          />

          <Filter
            name="nonTomcat"
            displayName="Non-Tomcat"
            checked={nonTomcat}
            onChange={onFilterChange}
            tooltip="Hide HTTP request processing threads"
          />

          <Filter
            name="database"
            displayName="Database"
            checked={database}
            onChange={onFilterChange}
            tooltip="Show only threads performing database queries and operations"
          />

          <Filter
            name="lucene"
            displayName="Lucene"
            checked={lucene}
            onChange={onFilterChange}
            tooltip="Show only threads performing search indexing and queries"
          />

          <Filter
            name="usingCpu"
            displayName="High CPU usage"
            checked={usingCpu}
            onChange={onFilterChange}
            tooltip="Show only threads using more than 10% CPU"
          />
        </div>

        <RegexFilters
          nameFilter={nameFilter}
          stackFilter={stackFilter}
          onRegExpChange={onRegExpChange}
        />
      </section>
    );
  }
}
