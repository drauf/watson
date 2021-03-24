import React from 'react';
import Filter from '../Filter/Filter';

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
  public render(): JSX.Element {
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
      <section id="threads-overview-settings">
        <div className="filters">
          <b>Filters:</b>

          <Filter
            name="active"
            displayName="Active"
            checked={active}
            onChange={onFilterChange}
          />

          <Filter
            name="nonJvm"
            displayName="Non-JVM"
            checked={nonJvm}
            onChange={onFilterChange}
          />

          <Filter
            name="tomcat"
            displayName="Tomcat"
            checked={tomcat}
            onChange={onFilterChange}
          />

          <Filter
            name="nonTomcat"
            displayName="Non-Tomcat"
            checked={nonTomcat}
            onChange={onFilterChange}
          />

          <Filter
            name="database"
            displayName="Database"
            checked={database}
            onChange={onFilterChange}
          />

          <Filter
            name="lucene"
            displayName="Lucene"
            checked={lucene}
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
            />
            <b>Thread name RegExp</b>
          </label>

          <label>
            <input
              type="text"
              name="stackFilter"
              value={stackFilter}
              onChange={onRegExpChange}
            />
            <b>Stack trace RegExp</b>
          </label>
        </div>
      </section>
    );
  }
}
