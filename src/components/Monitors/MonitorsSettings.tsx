import ButtonGroup from '@atlaskit/button/button-group';
import Text from '@atlaskit/primitives/text';
import React from 'react';
import Filter from '../Filter/Filter';
import RegexFilters from '../common/RegexFilters';
import TimeWindowFilter from '../TimeWindow/TimeWindowFilter';

interface Props {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class MonitorsSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      withOwner, withoutIdle, withoutOwner, nameFilter, stackFilter, onFilterChange, onRegExpChange,
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
              tooltip="Hide idle thread pool and queue monitoring patterns"
            />

            <Filter
              name="withOwner"
              displayName="Owned locks"
              checked={withOwner}
              onChange={onFilterChange}
              tooltip="Show only locks that have an owning thread - indicates active lock usage"
            />

            <Filter
              name="withoutOwner"
              displayName="Unowned locks"
              checked={withoutOwner}
              onChange={onFilterChange}
              tooltip="Show only locks without owners - potential deadlock or contention areas"
            />
          </ButtonGroup>
        </div>

        <RegexFilters
          nameFilter={nameFilter}
          stackFilter={stackFilter}
          onRegExpChange={onRegExpChange}
        />
      </section>
    );
  }
}
