import { isIdleInSnapshot } from '../../common/threadFilters';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import SimilarStacksGroup from './SimilarStacksGroup';
import './SimilarStacksPage.css';
import SimilarStacksSettings from './SimilarStacksSettings';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

type State = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
};

class SimilarStacksPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public override state: State = {
    linesToConsider: 40,
    minimalGroupSize: 2,
    withoutIdle: true,
  };

  public override render(): JSX.Element {
    const threadGroups = this.groupByStackTrace(this.props.threadDumps, this.state.linesToConsider)
      .filter((group) => group.length >= this.state.minimalGroupSize);

    if (!this.props.threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    return (
      <main>
        <SimilarStacksSettings
          linesToConsider={this.state.linesToConsider}
          minimalGroupSize={this.state.minimalGroupSize}
          withoutIdle={this.state.withoutIdle}
          onFilterChange={this.handleFilterChange}
          onIntegerChange={this.handleIntegerChange}
        />

        {this.renderThreadGroups(threadGroups)}
      </main>
    );
  }

  private renderThreadGroups = (threadGroups: Thread[][]) => {
    if (threadGroups.length === 0) {
      return <h4>{SimilarStacksPage.N0_THREADS_MATCHING}</h4>;
    }
    return threadGroups.map((group) => (
      <SimilarStacksGroup
        threadGroup={group}
        linesToConsider={this.state.linesToConsider}
      />
    ));
  };

  private groupByStackTrace = (threadDumps: ThreadDump[], linesToConsider: number) => {
    const grouped = new Map<string, Thread[]>();

    threadDumps.forEach((threadDump) => {
      threadDump.threads.forEach((thread) => {
        const stackTrace = this.getStackTrace(thread, linesToConsider);

        if (!stackTrace) {
          return;
        }

        let similarStacks = grouped.get(stackTrace);
        if (!similarStacks) {
          similarStacks = [];
        }
        similarStacks.push(thread);

        grouped.set(stackTrace, similarStacks);
      });
    });

    return Array.from(grouped.values()).sort((t1, t2) => t2.length - t1.length);
  };

  private getStackTrace = (thread: Thread, linesToConsider: number): string | null => {
    if (this.state.withoutIdle && isIdleInSnapshot(thread)) {
      return null;
    }

    if (linesToConsider < 1) {
      return thread.stackTrace.toString();
    }

    return thread.stackTrace.slice(0, linesToConsider).toString();
  };
}

export default withThreadDumps(SimilarStacksPage);
