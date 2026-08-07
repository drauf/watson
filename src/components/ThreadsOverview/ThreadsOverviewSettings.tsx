import ButtonGroup from '@atlaskit/button/button-group';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import Filter from '../Filter/Filter';
import HoverPopup from '../common/HoverPopup';
import RegexFilters from '../common/RegexFilters';
import ThreadLabelFilterButtons from '../common/ThreadLabelFilterButtons';
import { ThreadLabelFilterState } from '../../common/threadLabelFiltering';
import TimeWindowFilter from '../TimeWindow/TimeWindowFilter';

interface Props extends ThreadLabelFilterState {
  active: boolean;
  nonJvm: boolean;
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
      background,
      database,
      indexSearch,
      userDirectory,
      cpuActive,
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

            <ThreadLabelFilterButtons
              http={http}
              background={background}
              indexSearch={indexSearch}
              database={database}
              userDirectory={userDirectory}
              cpuActive={cpuActive}
              includeCpuActive
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
