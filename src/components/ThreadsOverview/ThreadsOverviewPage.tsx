import type { JSX } from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import {
  filterThreads,
  getThreadsMatchingStackFilter,
  isFilteredByStack,
  ThreadsOverviewFilters,
} from './threadsOverviewFilters';
import ThreadDump from '../../types/ThreadDump';
import EmptyState from '../Errors/EmptyState';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import './ThreadsOverviewPage.css';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';
import ThreadsOverviewTable from './ThreadsOverviewTable';
import { createThreadOverviewRows, ThreadOverviewDataRow } from './threadsOverviewRows';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

interface State {
  nonJvm: boolean;
  tomcat: boolean;
  nonTomcat: boolean;
  database: boolean;
  lucene: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
  dumpColumnWidth: number;
  stackPreviewLines: number;
}

class ThreadsOverviewPage extends PageWithSettings<WithThreadDumpsProps, State> {
  private cachedThreadDumps: ThreadDump[] | undefined;

  private cachedOverviewData: {
    nonEmptyThreadDumps: ThreadDump[];
    rows: ThreadOverviewDataRow[];
    dates: (string | null)[];
  } | undefined;

  public override state = {
    active: true,
    nonJvm: true,
    tomcat: false,
    nonTomcat: false,
    database: false,
    lucene: false,
    usingCpu: false,
    nameFilter: '',
    stackFilter: '',
    dumpColumnWidth: 160,
    stackPreviewLines: 10,
  };

  public override render(): JSX.Element {
    const { nonEmptyThreadDumps, rows, dates } = this.getData();
    const filters: ThreadsOverviewFilters = this.state;
    const filteredRows = filterThreads(rows, filters);
    const matchingStackFilter = getThreadsMatchingStackFilter(filteredRows, filters);
    const filteredByStack = isFilteredByStack(filters);

    if (nonEmptyThreadDumps.length === 0) {
      return <NoThreadDumpsError />;
    }

    return (
      <main className="full-width-page">
        <section id="heading">
          <ThreadsOverviewSettings
            active={this.state.active}
            nonJvm={this.state.nonJvm}
            tomcat={this.state.tomcat}
            nonTomcat={this.state.nonTomcat}
            database={this.state.database}
            lucene={this.state.lucene}
            usingCpu={this.state.usingCpu}
            nameFilter={this.state.nameFilter}
            stackFilter={this.state.stackFilter}
            dumpColumnWidth={this.state.dumpColumnWidth}
            stackPreviewLines={this.state.stackPreviewLines}
            onColumnWidthChange={this.handleColumnWidthChange}
            onStackPreviewLinesChange={this.handleStackPreviewLinesChange}
            onFilterChange={this.handleFilterChange}
            onRegExpChange={this.handleTextChange}
          />

          <ThreadsOverviewFilteringSummary
            isFilteredByStack={filteredByStack}
            threadsNumber={rows.length}
            rows={filteredRows}
            matchingStackFilter={matchingStackFilter}
          />

          <ThreadsOverviewLegend />
        </section>

        {filteredRows.length === 0 && <EmptyState />}
        <div hidden={filteredRows.length === 0}>
          <ThreadsOverviewTable
            dates={dates}
            rows={filteredRows}
            matchingStackFilter={matchingStackFilter}
            dumpColumnWidth={this.state.dumpColumnWidth}
            stackPreviewLines={this.state.stackPreviewLines}
          />
        </div>
      </main>
    );
  }

  private getData(): {
    nonEmptyThreadDumps: ThreadDump[];
    rows: ThreadOverviewDataRow[];
    dates: (string | null)[];
  } {
    if (this.cachedThreadDumps === this.props.threadDumps && this.cachedOverviewData) {
      return this.cachedOverviewData;
    }

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);
    this.cachedThreadDumps = this.props.threadDumps;
    this.cachedOverviewData = {
      nonEmptyThreadDumps,
      rows: createThreadOverviewRows(getThreadsOverTime(nonEmptyThreadDumps)),
      dates: nonEmptyThreadDumps.map((dump) => ThreadDump.getFormattedTime(dump)),
    };
    return this.cachedOverviewData;
  }

  private handleColumnWidthChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const dumpColumnWidth = target.valueAsNumber;

    if (Number.isFinite(dumpColumnWidth) && dumpColumnWidth >= 0) {
      this.setState({ dumpColumnWidth });
    }
  };

  private handleStackPreviewLinesChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const stackPreviewLines = target.valueAsNumber;

    if (Number.isFinite(stackPreviewLines) && stackPreviewLines >= 1) {
      this.setState({ stackPreviewLines });
    }
  };
}

export default withThreadDumps(ThreadsOverviewPage);
