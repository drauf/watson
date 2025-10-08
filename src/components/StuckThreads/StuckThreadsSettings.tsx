import React from 'react';
import Filter from '../Filter/Filter';
import SmartTooltip from '../common/SmartTooltip';
import RegexFilters from '../common/RegexFilters';

type Props = {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onIntegerChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class StuckThreadsSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      maxDifferingLines, minClusterSize, withoutIdle, nameFilter, stackFilter, onFilterChange, onIntegerChange, onRegExpChange,
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
              <div><strong>Minimum threads to detect stuck pattern</strong></div>
              <div>How many threads must have similar stacks to be considered stuck</div>
              <div>
                •
                <strong>2-3:</strong>
                {' '}
                Detect any repeated pattern
              </div>
              <div>
                •
                <strong>5-10:</strong>
                {' '}
                Focus on significant stuck patterns
              </div>
              <div>
                •
                <strong>15+:</strong>
                {' '}
                Only major blocking issues
              </div>
            </div>
          )}
          >
            <label>
              <b>Detection threshold</b>
              <input
                type="number"
                min="2"
                name="minClusterSize"
                value={minClusterSize}
                onChange={onIntegerChange}
              />
            </label>
          </SmartTooltip>

          <SmartTooltip tooltip={(
            <div>
              <div><strong>Stack trace similarity tolerance</strong></div>
              <div>Maximum different frames allowed between thread dumps</div>
              <div>
                •
                <strong>0-2:</strong>
                {' '}
                Very strict matching (identical stacks)
              </div>
              <div>
                •
                <strong>3-5:</strong>
                {' '}
                Allow minor variations
              </div>
              <div>
                •
                <strong>10+:</strong>
                {' '}
                Loose matching for broader patterns
              </div>
            </div>
          )}
          >
            <label>
              <b>Similarity tolerance</b>
              <input
                type="number"
                name="maxDifferingLines"
                value={maxDifferingLines}
                onChange={onIntegerChange}
              />
            </label>
          </SmartTooltip>
        </div>
      </section>
    );
  }
}
