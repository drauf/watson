import { Field } from '@atlaskit/form';
import Text from '@atlaskit/primitives/text';
import Textfield from '@atlaskit/textfield';
import React from 'react';
import SmartTooltip from './SmartTooltip';

interface Props {
  nameFilter: string;
  stackFilter: string;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

const threadNameTooltip = (
  <div>
    <div><Text as="strong" weight="bold">Filter threads by name using regex patterns</Text></div>
    <div>Match threads whose names contain specific text or patterns.</div>
    <br />
    <div>Common pattern types:</div>
    <div><Text as="strong" weight="bold">Starts with:</Text></div>
    <div>
      •
      <code>^http-nio-</code>
      {' '}
      → HTTP connector threads
    </div>
    <div><Text as="strong" weight="bold">Contains anywhere:</Text></div>
    <div>
      •
      <code>webhook</code>
      {' '}
      → Webhook processing threads
    </div>
    <div><Text as="strong" weight="bold">This OR that:</Text></div>
    <div>
      •
      <code>(scheduler|timer)</code>
      {' '}
      → Scheduled task threads
    </div>
    <div><Text as="strong" weight="bold">Exclude pattern:</Text></div>
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
    <div><Text as="strong" weight="bold">Filter threads by stack trace using regex patterns</Text></div>
    <div>Match threads with specific method calls or class names in their call stack.</div>
    <br />
    <div>Common pattern types:</div>
    <div><Text as="strong" weight="bold">Contains anywhere:</Text></div>
    <div>
      •
      <code>SQLException</code>
      {' '}
      → Database errors
    </div>
    <div><Text as="strong" weight="bold">Starts with:</Text></div>
    <div>
      •
      <code>^com\.atlassian\.webhook\.</code>
      {' '}
      → Webhook processing
    </div>
    <div><Text as="strong" weight="bold">This OR that:</Text></div>
    <div>
      •
      <code>(lucene|elasticsearch)</code>
      {' '}
      → Search operations
    </div>
    <div><Text as="strong" weight="bold">Exclude pattern:</Text></div>
    <div>
      •
      <code>^(?!.*\.wait\()</code>
      {' '}
      → Exclude waiting threads
    </div>
  </div>
);

const RegexFilters: React.FC<Props> = ({ nameFilter, stackFilter, onRegExpChange }) => (
  <div className="settings-row" id="regexp-filters">
    <SmartTooltip tooltip={threadNameTooltip}>
      <Field label="Thread name pattern" name="nameFilter" defaultValue={nameFilter}>
        {({ fieldProps }) => (
          <Textfield
            {...fieldProps}
            onChange={onRegExpChange}
            placeholder="e.g. http.*exec"
            value={nameFilter}
          />
        )}
      </Field>
    </SmartTooltip>

    <SmartTooltip tooltip={stackTraceTooltip}>
      <Field label="Stack trace pattern" name="stackFilter" defaultValue={stackFilter}>
        {({ fieldProps }) => (
          <Textfield
            {...fieldProps}
            onChange={onRegExpChange}
            placeholder="e.g. java\.io"
            value={stackFilter}
          />
        )}
      </Field>
    </SmartTooltip>
  </div>
);

export default RegexFilters;
