import { Field } from '@atlaskit/form';
import Text from '@atlaskit/primitives/text';
import Textfield from '@atlaskit/textfield';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
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
      <code>(lucene|opensearch)</code>
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

const REGEXP_CHANGE_DELAY_MS = 300;

type FilterName = 'nameFilter' | 'stackFilter';

const RegexFilters: React.FC<Props> = ({
  nameFilter,
  stackFilter,
  onRegExpChange,
}) => {
  const [draftNameFilter, setDraftNameFilter] = useState(nameFilter);
  const [draftStackFilter, setDraftStackFilter] = useState(stackFilter);
  const pendingChanges = useRef<Record<FilterName, ReturnType<typeof setTimeout> | undefined>>({
    nameFilter: undefined,
    stackFilter: undefined,
  });
  const committedValues = useRef<Record<FilterName, string>>({
    nameFilter,
    stackFilter,
  });

  useEffect(() => {
    if (nameFilter === committedValues.current.nameFilter) {
      return;
    }
    clearTimeout(pendingChanges.current.nameFilter);
    pendingChanges.current.nameFilter = undefined;
    committedValues.current.nameFilter = nameFilter;

    setDraftNameFilter(nameFilter);
  }, [nameFilter]);

  useEffect(() => {
    if (stackFilter === committedValues.current.stackFilter) {
      return;
    }
    clearTimeout(pendingChanges.current.stackFilter);
    pendingChanges.current.stackFilter = undefined;
    committedValues.current.stackFilter = stackFilter;

    setDraftStackFilter(stackFilter);
  }, [stackFilter]);

  useEffect(() => () => {
    Object.values(pendingChanges.current).forEach(clearTimeout);
  }, []);

  const commitChange = useCallback((name: FilterName, value: string) => {
    committedValues.current[name] = value;
    onRegExpChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
  }, [onRegExpChange]);

  const scheduleChange = useCallback((name: FilterName, value: string) => {
    clearTimeout(pendingChanges.current[name]);
    pendingChanges.current[name] = undefined;
    if (!value) {
      commitChange(name, value);
      return;
    }
    pendingChanges.current[name] = setTimeout(() => {
      pendingChanges.current[name] = undefined;
      commitChange(name, value);
    }, REGEXP_CHANGE_DELAY_MS);
  }, [commitChange]);

  const changeDraft = useCallback((name: FilterName, value: string) => {
    if (name === 'nameFilter') {
      setDraftNameFilter(value);
    } else {
      setDraftStackFilter(value);
    }
    scheduleChange(name, value);
  }, [scheduleChange]);

  const flushChange = useCallback((name: FilterName, value: string) => {
    if (!pendingChanges.current[name]) {
      return;
    }
    clearTimeout(pendingChanges.current[name]);
    pendingChanges.current[name] = undefined;
    commitChange(name, value);
  }, [commitChange]);

  const createFieldProps = (name: FilterName, value: string) => ({
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => changeDraft(name, event.target.value),
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        flushChange(name, value);
      }
    },
    onBlur: () => flushChange(name, value),
    value,
  });

  return (
    <>
      <HoverPopup content={threadNameTooltip}>
        <Field label="Thread name pattern" name="nameFilter" defaultValue={nameFilter}>
          {({ fieldProps }) => (
            <Textfield
              {...fieldProps}
              {...createFieldProps('nameFilter', draftNameFilter)}
              placeholder="e.g. http.*exec"
            />
          )}
        </Field>
      </HoverPopup>

      <HoverPopup content={stackTraceTooltip}>
        <Field label="Stack trace pattern" name="stackFilter" defaultValue={stackFilter}>
          {({ fieldProps }) => (
            <Textfield
              {...fieldProps}
              {...createFieldProps('stackFilter', draftStackFilter)}
              placeholder="e.g. java\\.io"
            />
          )}
        </Field>
      </HoverPopup>
    </>
  );
};

export default RegexFilters;
