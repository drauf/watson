import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  withoutIdle: boolean;
  search: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class FlameGraphSettings extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const {
      withoutIdle, search, onFilterChange, onSearchChange,
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
            type="text"
            name="search"
            value={search}
            onChange={onSearchChange}
          />
          <b>Search</b>
        </label>
      </section>
    );
  }
}
