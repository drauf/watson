import ButtonGroup from '@atlaskit/button/button-group';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import TextField from '@atlaskit/textfield';
import { Field } from '@atlaskit/form';
import HoverPopup from '../common/HoverPopup';
import Filter from '../Filter/Filter';
import RegexFilters from '../common/RegexFilters';
import TimeWindowFilter from '../TimeWindow/TimeWindowFilter';

interface Props {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class StuckThreadsSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      maxDifferingLines, minClusterSize, withoutIdle, nameFilter, stackFilter, onFilterChange, onIntegerChange, onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <TimeWindowFilter />

        <section className="filters">
          <Text weight="bold">Filters:</Text>

          <ButtonGroup>
            <Filter
              name="withoutIdle"
              displayName="Active"
              checked={withoutIdle}
              onChange={onFilterChange}
              tooltip="Hide threads waiting for I/O or in thread pools"
            />
          </ButtonGroup>
        </section>

        <section>
          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />

          <HoverPopup
            content={(
              <>
                <Text as="p" weight="bold">Minimum threads to detect stuck pattern</Text>
                <Text as="p">How many threads must have similar stacks to be considered stuck</Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">2-3:</Text>
                  {' '}
                  Detect any repeated pattern
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">5-10:</Text>
                  {' '}
                  Focus on significant stuck patterns
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">15+:</Text>
                  {' '}
                  Only major blocking issues
                </Text>
              </>
            )}
          >
            <Field label="Detection threshold" name="minClusterSize" defaultValue={minClusterSize}>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  id="minClusterSize"
                  type="number"
                  min={2}
                  value={minClusterSize}
                  onChange={onIntegerChange}
                />
              )}
            </Field>
          </HoverPopup>

          <HoverPopup
            content={(
              <>
                <Text as="p" weight="bold">Stack trace similarity tolerance</Text>
                <Text as="p">Maximum different frames allowed between thread dumps</Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">0-2:</Text>
                  {' '}
                  Very strict matching (identical stacks)
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">3-5:</Text>
                  {' '}
                  Allow minor variations
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">10+:</Text>
                  {' '}
                  Loose matching for broader patterns
                </Text>
              </>
            )}
          >
            <Field label="Similarity tolerance" name="maxDifferingLines" defaultValue={maxDifferingLines}>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  id="maxDifferingLines"
                  type="number"
                  value={maxDifferingLines}
                  onChange={onIntegerChange}
                />
              )}
            </Field>
          </HoverPopup>
        </section>
      </section>
    );
  }
}
