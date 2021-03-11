import isIdleThread from '../../common/isIdleThread';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import PageWithSettings from '../BasePage/PageWithSettings';
import SimilarStacksGroup from './SimilarStacksGroup';
import './SimilarStacksPage.css';
import SimilarStacksSettings from './SimilarStacksSettings';

type State = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
};

export default class SimilarStacksPage extends PageWithSettings<State> {
  public state: State = {
    linesToConsider: 40,
    minimalGroupSize: 2,
    withoutIdle: true,
  };

  protected PAGE_NAME = 'Similar Stacks';

  public render(): JSX.Element {
    const threadGroups = this.groupByStackTrace(this.props.threadDumps, this.state.linesToConsider)
      .filter((group) => group.length >= this.state.minimalGroupSize);

    return (
      <main>
        <SimilarStacksSettings
          linesToConsider={this.state.linesToConsider}
          minimalGroupSize={this.state.minimalGroupSize}
          withoutIdle={this.state.withoutIdle}
          onFilterChange={this.handleFilterChange}
          onIntegerChange={this.handleIntegerChange}
        />

        {!this.props.threadDumps.some((dump) => dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: SimilarStacksPage.NO_THREAD_DUMPS }} />
          : this.renderThreadGroups(threadGroups)}
      </main>
    );
  }

  private renderThreadGroups(threadGroups: Thread[][]) {
    if (threadGroups.length === 0) {
      return <h4>{SimilarStacksPage.N0_THREADS_MATCHING}</h4>;
    }
    return threadGroups.map((group) => (
      <SimilarStacksGroup
        key={group.length}
        threadGroup={group}
        linesToConsider={this.state.linesToConsider}
      />
    ));
  }

  private groupByStackTrace(threadDumps: ThreadDump[], linesToConsider: number) {
    const grouped: Map<string, Thread[]> = new Map();

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
  }

  private getStackTrace(thread: Thread, linesToConsider: number): string | null {
    if (this.state.withoutIdle && isIdleThread(thread)) {
      return null;
    }

    if (linesToConsider < 1) {
      return thread.stackTrace.toString();
    }

    return thread.stackTrace.slice(0, linesToConsider).toString();
  }
}
