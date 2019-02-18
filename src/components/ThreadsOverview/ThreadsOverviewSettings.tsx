import React from 'react';
import Filter from '../Filter/Filter';

type ThreadsOverviewSettingsProps = {
  tomcat: boolean;
  nonTomcat: boolean;
  database: boolean;
  lucene: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

const ThreadsOverviewSettings: React.SFC<ThreadsOverviewSettingsProps> = ({ tomcat, nonTomcat,
  database, lucene, nameFilter, stackFilter, onFilterChange, onRegExpChange }) => (
    <div id="threads-overview-settings">
      <div className="filters">
        <b>Filters:</b>

        <Filter name="tomcat" displayName="Tomcat"
          checked={tomcat} onChange={onFilterChange} />

        <Filter name="nonTomcat" displayName="Non-Tomcat"
          checked={nonTomcat} onChange={onFilterChange} />

        <Filter name="database" displayName="Database"
          checked={database} onChange={onFilterChange} />

        <Filter name="lucene" displayName="Lucene"
          checked={lucene} onChange={onFilterChange} />
      </div>

      <div id="regexp-filters">
        <label>
          <input type="text" name="nameFilter" value={nameFilter} onChange={onRegExpChange}
          />
          <b>Thread name RegExp</b>
        </label>

        <label>
          <input type="text" name="stackFilter" value={stackFilter} onChange={onRegExpChange}
          />
          <b>Stack trace RegExp</b>
        </label>
      </div>
    </div>
  );

export default ThreadsOverviewSettings;
