import React from 'react';
import { ThreadLabelFilterState } from '../../common/threadLabelFiltering';
import Filter from '../Filter/Filter';

interface Props extends ThreadLabelFilterState {
  includeCpuActive: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
}

const ThreadLabelFilterButtons: React.FC<Props> = ({
  http,
  background,
  indexSearch,
  database,
  userDirectory,
  cpuActive,
  includeCpuActive,
  onFilterChange,
}) => (
  <>
    <Filter
      name="http"
      displayName="HTTP"
      checked={http}
      onChange={onFilterChange}
      tooltip="Show HTTP request-processing threads, including browser and REST API actions"
    />

    <Filter
      name="background"
      displayName="Background"
      checked={background}
      onChange={onFilterChange}
      tooltip="Show non-HTTP background threads, such as schedulers and internal workers"
    />

    <Filter
      name="indexSearch"
      displayName="Index search"
      checked={indexSearch}
      onChange={onFilterChange}
      tooltip="Show threads performing Lucene or OpenSearch indexing and queries"
    />

    <Filter
      name="database"
      displayName="Database"
      checked={database}
      onChange={onFilterChange}
      tooltip="Show threads performing database queries and operations"
    />

    <Filter
      name="userDirectory"
      displayName="User directory"
      checked={userDirectory}
      onChange={onFilterChange}
      tooltip="Show threads calling Atlassian Embedded Crowd for user and group directory lookups"
    />

    {includeCpuActive && (
      <Filter
        name="cpuActive"
        displayName="CPU active"
        checked={cpuActive}
        onChange={onFilterChange}
        tooltip="Show only threads using at least 10% CPU"
      />
    )}
  </>
);

export default ThreadLabelFilterButtons;
