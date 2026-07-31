import { Field } from '@atlaskit/form';
import Text from '@atlaskit/primitives/text';
import Textfield from '@atlaskit/textfield';
import React from 'react';
import HoverPopup from './HoverPopup';

interface Props {
  nameFilter: string;
  stackFilter: string;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

const threadNameTooltip = (
  <>
    <Text as="p" weight="bold">Filter threads by name using regex patterns</Text>
    <Text as="p">Match threads whose names contain specific text or patterns.</Text>
    <hr />
    <Text as="p">Common pattern types:</Text>
    <Text as="p" weight="bold">Starts with:</Text>
    <Text as="p">
      •
      {' '}
      <code>^http-nio-</code>
      {' '}
      → HTTP connector threads
    </Text>
    <Text as="p" weight="bold">Contains anywhere:</Text>
    <Text as="p">
      •
      {' '}
      <code>webhook</code>
      {' '}
      → Webhook processing threads
    </Text>
    <Text as="p" weight="bold">This OR that:</Text>
    <Text as="p">
      •
      {' '}
      <code>(scheduler|timer)</code>
      {' '}
      → Scheduled task threads
    </Text>
    <Text as="p" weight="bold">Exclude pattern:</Text>
    <Text as="p">
      •
      {' '}
      <code>^(?!.*RMI)</code>
      {' '}
      → Exclude RMI threads
    </Text>
  </>
);

const stackTraceTooltip = (
  <>
    <Text as="p" weight="bold">Filter threads by stack trace using regex patterns</Text>
    <Text as="p">Match threads with specific method calls or class names in their call stack.</Text>
    <hr />
    <Text as="p">Common pattern types:</Text>
    <Text as="p" weight="bold">Contains anywhere:</Text>
    <Text as="p">
      •
      {' '}
      <code>SQLException</code>
      {' '}
      → Database errors
    </Text>
    <Text as="p" weight="bold">Starts with:</Text>
    <Text as="p">
      •
      {' '}
      <code>^com\.atlassian\.webhook\.</code>
      {' '}
      → Webhook processing
    </Text>
    <Text as="p" weight="bold">This OR that:</Text>
    <Text as="p">
      •
      {' '}
      <code>(lucene|elasticsearch)</code>
      {' '}
      → Search operations
    </Text>
    <Text as="p" weight="bold">Exclude pattern:</Text>
    <Text as="p">
      •
      {' '}
      <code>^(?!.*\.wait\()</code>
      {' '}
      → Exclude waiting threads
    </Text>
  </>
);

const RegexFilters: React.FC<Props> = ({
  nameFilter,
  stackFilter,
  onRegExpChange,
}) => (
  <>
    <HoverPopup content={threadNameTooltip}>
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
    </HoverPopup>

    <HoverPopup content={stackTraceTooltip}>
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
    </HoverPopup>

  </>
);

export default RegexFilters;
