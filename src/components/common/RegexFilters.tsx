import React from 'react';
import SmartTooltip from './SmartTooltip';

type Props = {
  nameFilter: string;
  stackFilter: string;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

const threadNameTooltip = (
  <div>
    <div><strong>Filter threads by name using regex patterns</strong></div>
    <div>Match threads whose names contain specific text or patterns.</div>
    <br />
    <div>Common pattern types:</div>
    <div><strong>Starts with:</strong></div>
    <div>
      •
      <code>^http-nio-</code>
      {' '}
      → HTTP connector threads
    </div>
    <div><strong>Contains anywhere:</strong></div>
    <div>
      •
      <code>webhook</code>
      {' '}
      → Webhook processing threads
    </div>
    <div><strong>This OR that:</strong></div>
    <div>
      •
      <code>(scheduler|timer)</code>
      {' '}
      → Scheduled task threads
    </div>
    <div><strong>Exclude pattern:</strong></div>
    <div>
      •
      <code>^(?!.*RMI)</code>
      {' '}
      → Exclude RMI threads
    </div>
  </div>
);

const stackTraceTooltip = (
  <div>
    <div><strong>Filter threads by stack trace using regex patterns</strong></div>
    <div>Match threads with specific method calls or class names in their call stack.</div>
    <br />
    <div>Common pattern types:</div>
    <div><strong>Contains anywhere:</strong></div>
    <div>
      •
      <code>SQLException</code>
      {' '}
      → Database errors
    </div>
    <div><strong>Starts with:</strong></div>
    <div>
      •
      <code>^com\.atlassian\.webhook\.</code>
      {' '}
      → Webhook processing
    </div>
    <div><strong>This OR that:</strong></div>
    <div>
      •
      <code>(lucene|elasticsearch)</code>
      {' '}
      → Search operations
    </div>
    <div><strong>Exclude pattern:</strong></div>
    <div>
      •
      <code>^(?!.*\.wait\()</code>
      {' '}
      → Exclude waiting threads
    </div>
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
