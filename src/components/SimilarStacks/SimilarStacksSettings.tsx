import React from 'react';
import Filter from '../Filter/Filter';
import SmartTooltip from '../common/SmartTooltip';
import RegexFilters from '../common/RegexFilters';

type Props = {
  linesToConsider: number;
  minimumGroupSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class SimilarStacksSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      linesToConsider, minimumGroupSize, withoutIdle, nameFilter, stackFilter, onFilterChange, onIntegerChange, onRegExpChange,
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

        <RegexFilters
          nameFilter={nameFilter}
          stackFilter={stackFilter}
          onRegExpChange={onRegExpChange}
        />

        <div>
          <SmartTooltip tooltip={(
            <div>
              <div><strong>Stack trace depth for comparison</strong></div>
              <div>How many stack frames to compare when grouping threads</div>
              <div>
                •
                <strong>5-10:</strong>
                {' '}
                Focus on immediate call context
              </div>
              <div>
                •
                <strong>15-20:</strong>
                {' '}
                Balanced detail level
              </div>
              <div>
                •
                <strong>30+:</strong>
                {' '}
                Very detailed grouping
              </div>
            </div>
          )}
          >
            <label>
              <b>Comparison depth</b>
              <input
                type="number"
                name="linesToConsider"
                value={linesToConsider}
                onChange={onIntegerChange}
              />
            </label>
          </SmartTooltip>

          <SmartTooltip tooltip={(
            <div>
              <div><strong>Minimum threads per group</strong></div>
              <div>Only show groups with at least this many similar threads</div>
              <div>
                •
                <strong>2-3:</strong>
                {' '}
                Show all similar patterns
              </div>
              <div>
                •
                <strong>5-10:</strong>
                {' '}
                Focus on common patterns
              </div>
              <div>
                •
                <strong>20+:</strong>
                {' '}
                Only show very frequent patterns
              </div>
            </div>
          )}
          >
            <label>
              <b>Minimum group size</b>
              <input
                type="number"
                name="minimalGroupSize"
                value={minimumGroupSize}
                onChange={onIntegerChange}
              />
            </label>
          </SmartTooltip>
        </div>
      </section>
    );
  }
}
