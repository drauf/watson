import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class StuckThreadsSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      maxDifferingLines, minClusterSize, withoutIdle, onFilterChange, onIntegerChange,
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
            min="2"
            name="minClusterSize"
            value={minClusterSize}
            onChange={onIntegerChange}
          />
          <b>Minimal similar stacks to consider a thread stuck</b>
        </label>

        <label>
          <input
            type="number"
            name="maxDifferingLines"
            value={maxDifferingLines}
            onChange={onIntegerChange}
          />
          <b>Maximum differing lines between dumps</b>
        </label>
      </section>
    );
  }
}
