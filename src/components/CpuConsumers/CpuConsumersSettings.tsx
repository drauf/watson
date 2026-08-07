import ButtonGroup from '@atlaskit/button/button-group';
import Button from '@atlaskit/button/new';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import CpuConsumersMode from './CpuConsumersMode';
import RegexFilters from '../common/RegexFilters';
import ThreadLabelFilterButtons from '../common/ThreadLabelFilterButtons';
import { ThreadLabelFilterState } from '../../common/threadLabelFiltering';

interface Props extends ThreadLabelFilterState {
  mode: CpuConsumersMode;
  nameFilter: string;
  stackFilter: string;
  onModeChange: (mode: CpuConsumersMode) => void;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

const sortModes = [
  { mode: CpuConsumersMode.Mean, label: 'Mean' },
  { mode: CpuConsumersMode.Median, label: 'Median' },
  { mode: CpuConsumersMode.Max, label: 'Max' },
];

export default class CpuConsumersSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      mode, nameFilter, stackFilter,
      http, background, indexSearch, database, userDirectory, cpuActive,
      onModeChange, onFilterChange, onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <section className="filters">
          <Text weight="bold">Sort threads by</Text>

          <ButtonGroup>
            {sortModes.map(({ mode: sortMode, label }) => (
              <Button
                key={sortMode}
                appearance="default"
                isSelected={mode === sortMode}
                onClick={() => onModeChange(sortMode)}
                aria-pressed={mode === sortMode}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>

          <Text weight="bold">CPU usage</Text>
        </section>

        <section className="filters">
          <Text weight="bold">Filters:</Text>

          <ButtonGroup>
            <ThreadLabelFilterButtons
              http={http}
              background={background}
              indexSearch={indexSearch}
              database={database}
              userDirectory={userDirectory}
              cpuActive={cpuActive}
              includeCpuActive={false}
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
    );
  }
}
