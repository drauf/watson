import React from 'react';
import SmartTooltip from './SmartTooltip';

type Props = {
  nameFilter: string;
  stackFilter: string;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

const threadNameTooltip = (
  <div>
    <div><strong>Filter by thread name pattern</strong></div>
    <div>Examples:</div>
    <div>• <code>http.*exec</code> → Tomcat request threads</div>
    <div>• <code>^main$</code> → Main thread only</div>
    <div>• <code>pool.*worker</code> → Thread pool workers</div>
    <div>• <code>RMI.*Connection</code> → RMI connection handlers</div>
  </div>
);

const stackTraceTooltip = (
  <div>
    <div><strong>Filter by stack trace pattern</strong></div>
    <div>Examples:</div>
    <div>• <code>java\.io</code> → I/O operations</div>
    <div>• <code>SQLException</code> → Database errors</div>
    <div>• <code>com\.atlassian</code> → Atlassian code</div>
    <div>• <code>Lock.*wait</code> → Lock contention</div>
    <div>• <code>Thread\.sleep</code> → Sleeping threads</div>
  </div>
);

const RegexFilters: React.FC<Props> = ({ nameFilter, stackFilter, onRegExpChange }) => (
  <div id="regexp-filters">
    <SmartTooltip tooltip={threadNameTooltip}>
      <label>
        <b>Thread name pattern</b>
        <input
          type="text"
          name="nameFilter"
          value={nameFilter}
          onChange={onRegExpChange}
          placeholder="e.g. http.*exec"
        />
      </label>
    </SmartTooltip>

    <SmartTooltip tooltip={stackTraceTooltip}>
      <label>
        <b>Stack trace pattern</b>
        <input
          type="text"
          name="stackFilter"
          value={stackFilter}
          onChange={onRegExpChange}
          placeholder="e.g. java\.io"
        />
      </label>
    </SmartTooltip>
  </div>
);

export default RegexFilters;