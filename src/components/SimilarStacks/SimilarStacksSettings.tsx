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
  linesToConsider: number;
  minimumGroupSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class SimilarStacksSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      linesToConsider, minimumGroupSize, withoutIdle, nameFilter, stackFilter, onFilterChange, onIntegerChange, onRegExpChange,
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
                <Text as="p" weight="bold">Stack trace depth for comparison</Text>
                <Text as="p">How many stack frames to compare when grouping threads</Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">5-10:</Text>
                  {' '}
                  Focus on immediate call context
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">15-20:</Text>
                  {' '}
                  Balanced detail level
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">30+:</Text>
                  {' '}
                  Very detailed grouping
                </Text>
              </>
            )}
          >
            <Field label="Comparison depth" name="linesToConsider" defaultValue={linesToConsider}>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  id="linesToConsider"
                  type="number"
                  value={linesToConsider}
                  onChange={onIntegerChange}
                />
              )}
            </Field>
          </HoverPopup>

          <HoverPopup
            content={(
              <>
                <Text as="p" weight="bold">Minimum threads per group</Text>
                <Text as="p">Only show groups with at least this many similar threads</Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">2-3:</Text>
                  {' '}
                  Show all similar patterns
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">5-10:</Text>
                  {' '}
                  Focus on common patterns
                </Text>
                <Text as="p">
                  •
                  {' '}
                  <Text as="strong" weight="bold">20+:</Text>
                  {' '}
                  Only show very frequent patterns
                </Text>
              </>
            )}
          >
            <Field label="Minimum group size" name="minimumGroupSize" defaultValue={minimumGroupSize}>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  id="minimumGroupSize"
                  type="number"
                  value={minimumGroupSize}
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
