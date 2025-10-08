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
            displayName="Active"
            checked={withoutIdle}
            onChange={onFilterChange}
            tooltip="Hide threads waiting for I/O or in thread pools"
          />
        </div>

        <div>
          <label>
            <b>Minimal similar stacks to consider a thread stuck</b>
            <input
              type="number"
              min="2"
              name="minClusterSize"
              value={minClusterSize}
              onChange={onIntegerChange}
            />
          </label>
        </div>

        <div>
          <label>
            <b>Maximum differing lines between dumps</b>
            <input
              type="number"
              name="maxDifferingLines"
              value={maxDifferingLines}
              onChange={onIntegerChange}
            />
          </label>
        </div>
      </section>
    );
  }
}
