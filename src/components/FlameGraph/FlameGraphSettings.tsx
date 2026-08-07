import ButtonGroup from '@atlaskit/button/button-group';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import Filter from '../Filter/Filter';
import RegexFilters from '../common/RegexFilters';
import ThreadLabelFilterButtons from '../common/ThreadLabelFilterButtons';
import TimeWindowFilter from '../TimeWindow/TimeWindowFilter';
import { ThreadLabelFilterState } from '../../common/threadLabelFiltering';

interface Props extends ThreadLabelFilterState {
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class FlameGraphSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      withoutIdle,
      nameFilter,
      stackFilter,
      http,
      background,
      indexSearch,
      database,
      userDirectory,
      cpuActive,
      onFilterChange,
      onRegExpChange,
    } = this.props;

    return (
      <section id="heading">
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

              <ThreadLabelFilterButtons
                http={http}
                background={background}
                indexSearch={indexSearch}
                database={database}
                userDirectory={userDirectory}
                cpuActive={cpuActive}
                includeCpuActive
                onFilterChange={onFilterChange}
              />
            </ButtonGroup>
          </section>

          <section>
            <RegexFilters
              nameFilter={nameFilter}
              stackFilter={stackFilter}
              onRegExpChange={onRegExpChange}
            />
          </section>
        </section>
      </section>
    );
  }
}
