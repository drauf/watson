import ButtonGroup from '@atlaskit/button/button-group';
import Text from '@atlaskit/primitives/text';
import React from 'react';
import TextField from '@atlaskit/textfield';
import { Field } from '@atlaskit/form';
import Filter from '../Filter/Filter';
import SmartTooltip from '../common/SmartTooltip';
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
        <div className="filters">
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
        </div>

        <div className="settings-row">
          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />

          <SmartTooltip tooltip={(
            <div>
              <div><Text as="strong" weight="bold">Stack trace depth for comparison</Text></div>
              <div>How many stack frames to compare when grouping threads</div>
              <div>
                •
                <Text as="strong" weight="bold">5-10:</Text>
                {' '}
                Focus on immediate call context
              </div>
              <div>
                •
                <Text as="strong" weight="bold">15-20:</Text>
                {' '}
                Balanced detail level
              </div>
              <div>
                •
                <Text as="strong" weight="bold">30+:</Text>
                {' '}
                Very detailed grouping
              </div>
            </div>
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
          </SmartTooltip>

          <SmartTooltip tooltip={(
            <div>
              <div><Text as="strong" weight="bold">Minimum threads per group</Text></div>
              <div>Only show groups with at least this many similar threads</div>
              <div>
                •
                <Text as="strong" weight="bold">2-3:</Text>
                {' '}
                Show all similar patterns
              </div>
              <div>
                •
                <Text as="strong" weight="bold">5-10:</Text>
                {' '}
                Focus on common patterns
              </div>
              <div>
                •
                <Text as="strong" weight="bold">20+:</Text>
                {' '}
                Only show very frequent patterns
              </div>
            </div>
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
          </SmartTooltip>
        </div>
      </section>
    );
  }
}
