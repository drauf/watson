import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class SimilarStacksSettings extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const {
      linesToConsider, minimalGroupSize, withoutIdle, onFilterChange, onIntegerChange,
    } = this.props;

    return (
      <section id="settings">
        <div className="filters">
          <b>Filters:</b>

          <Filter
            name="withoutIdle"
            displayName="Without Idle"
            checked={withoutIdle}
            onChange={onFilterChange}
          />
        </div>

        <label>
          <input
            type="number"
            name="linesToConsider"
            value={linesToConsider}
            onChange={onIntegerChange}
          />
          <b>Stack trace lines to compare</b>
        </label>

        <label>
          <input
            type="number"
            name="minimalGroupSize"
            value={minimalGroupSize}
            onChange={onIntegerChange}
          />
          <b>Minimal group size to show</b>
        </label>
      </section>
    );
  }
}
