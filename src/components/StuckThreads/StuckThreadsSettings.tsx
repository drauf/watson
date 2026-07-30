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
              <div><Text as="strong" weight="bold">Minimum threads to detect stuck pattern</Text></div>
              <div>How many threads must have similar stacks to be considered stuck</div>
              <div>
                •
                <Text as="strong" weight="bold">2-3:</Text>
                {' '}
                Detect any repeated pattern
              </div>
              <div>
                •
                <Text as="strong" weight="bold">5-10:</Text>
                {' '}
                Focus on significant stuck patterns
              </div>
              <div>
                •
                <Text as="strong" weight="bold">15+:</Text>
                {' '}
                Only major blocking issues
              </div>
            </div>
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
          </SmartTooltip>

          <SmartTooltip tooltip={(
            <div>
              <div><Text as="strong" weight="bold">Stack trace similarity tolerance</Text></div>
              <div>Maximum different frames allowed between thread dumps</div>
              <div>
                •
                <Text as="strong" weight="bold">0-2:</Text>
                {' '}
                Very strict matching (identical stacks)
              </div>
              <div>
                •
                <Text as="strong" weight="bold">3-5:</Text>
                {' '}
                Allow minor variations
              </div>
              <div>
                •
                <Text as="strong" weight="bold">10+:</Text>
                {' '}
                Loose matching for broader patterns
              </div>
            </div>
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
          </SmartTooltip>
        </div>
      </section>
    );
  }
}
