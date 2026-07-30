import ButtonGroup from '@atlaskit/button/button-group';
import Button from '@atlaskit/button/new';
import Text from '@atlaskit/primitives/text';
import React from 'react';
import CpuConsumersMode from './CpuConsumersMode';
import RegexFilters from '../common/RegexFilters';

interface Props {
  mode: CpuConsumersMode;
  nameFilter: string;
  stackFilter: string;
  onModeChange: (mode: CpuConsumersMode) => void;
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
      mode, nameFilter, stackFilter, onModeChange, onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
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
        </div>

        <div className="settings-row">
          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />
        </div>
      </section>
    );
  }
}
