import React from 'react';
import Filter from '../Filter/Filter';

type Props = {
  withoutIdle: boolean;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class FlameGraphSettings extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const {
      withoutIdle, onFilterChange,
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
      </section>
    );
  }
}
