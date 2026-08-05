import ButtonGroup from '@atlaskit/button/button-group';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import Filter from '../Filter/Filter';
import HoverPopup from '../common/HoverPopup';
import RegexFilters from '../common/RegexFilters';
import TimeWindowFilter from '../TimeWindow/TimeWindowFilter';

const stackFilterTooltip = (description: string): JSX.Element => (
  <>
    <p>{description}</p>
    <p>Combines with other stack filters to narrow results.</p>
  </>
);

interface Props {
  active: boolean;
  nonJvm: boolean;
  http: boolean;
  nonHttp: boolean;
  database: boolean;
  indexSearch: boolean;
  crowd: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
  dumpColumnWidth: number;
  stackPreviewLines: number;
  onColumnWidthChange: React.ChangeEventHandler<HTMLInputElement>;
  onStackPreviewLinesChange: React.ChangeEventHandler<HTMLInputElement>;
  onFilterChange: React.ChangeEventHandler<HTMLInputElement>;
  onRegExpChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default class ThreadsOverviewSettings extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      active,
      nonJvm,
      http,
      nonHttp,
      database,
      indexSearch,
      crowd,
      usingCpu,
      nameFilter,
      stackFilter,
      dumpColumnWidth,
      stackPreviewLines,
      onColumnWidthChange,
      onStackPreviewLinesChange,
      onFilterChange,
      onRegExpChange,
    } = this.props;

    return (
      <section id="settings">
        <TimeWindowFilter />

        <section className="filters">
          <Text weight="bold">Filters:</Text>

          <ButtonGroup>
            <Filter
              name="active"
              displayName="Active"
              checked={active}
              onChange={onFilterChange}
              tooltip="Show only threads that changed state between dumps or are experiencing contention"
            />

            <Filter
              name="nonJvm"
              displayName="Non-JVM"
              checked={nonJvm}
              onChange={onFilterChange}
              tooltip="Hide JVM housekeeping threads (GC, compiler, etc.)"
            />

            <Filter
              name="http"
              displayName="HTTP"
              checked={http}
              onChange={onFilterChange}
              tooltip="Show HTTP request-processing threads, including browser and REST API actions"
            />

            <Filter
              name="nonHttp"
              displayName="Non-HTTP"
              checked={nonHttp}
              onChange={onFilterChange}
              tooltip="Hide HTTP request-processing threads to focus on background activity"
            />

            <Filter
              name="database"
              displayName="Database"
              checked={database}
              onChange={onFilterChange}
              tooltip={stackFilterTooltip('Show threads performing database queries and operations.')}
            />

            <Filter
              name="indexSearch"
              displayName="Index search"
              checked={indexSearch}
              onChange={onFilterChange}
              tooltip={stackFilterTooltip('Show threads performing Lucene or OpenSearch indexing and queries.')}
            />

            <Filter
              name="crowd"
              displayName="User directory"
              checked={crowd}
              onChange={onFilterChange}
              tooltip={stackFilterTooltip('Show threads calling Atlassian Embedded Crowd for user and group directory lookups.')}
            />

            <Filter
              name="usingCpu"
              displayName="High CPU usage"
              checked={usingCpu}
              onChange={onFilterChange}
              tooltip="Show only threads using more than 10% CPU"
            />
          </ButtonGroup>
        </section>

        <section>
          <RegexFilters
            nameFilter={nameFilter}
            stackFilter={stackFilter}
            onRegExpChange={onRegExpChange}
          />

          <HoverPopup content="Sets the minimum width of each table column in pixels. Enter 0 to fit all timestamp columns into the current viewport.">
            <Field label="Table column width" name="tableColumnWidth">
              {({ fieldProps }) => (
                <Textfield
                  {...fieldProps}
                  min={0}
                  step={10}
                  type="number"
                  value={dumpColumnWidth}
                  onChange={onColumnWidthChange}
                />
              )}
            </Field>
          </HoverPopup>

          <HoverPopup content="Sets how many stack frames appear in the Threads overview cell popup.">
            <Field label="Stack preview lines" name="stackPreviewLines">
              {({ fieldProps }) => (
                <Textfield
                  {...fieldProps}
                  min={1}
                  step={1}
                  type="number"
                  value={stackPreviewLines}
                  onChange={onStackPreviewLinesChange}
                />
              )}
            </Field>
          </HoverPopup>
        </section>
      </section>
    );
  }
}
