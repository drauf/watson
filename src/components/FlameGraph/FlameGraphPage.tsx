import { StackFrame } from 'd3-flame-graph';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';
import isIdleThread from '../../common/isIdleThread';

// todo: additional filtering options
type State = {
  withoutIdle: boolean;
};

export default class FlameGraphPage extends PageWithSettings<State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);
    this.state = {
      withoutIdle: true,
    };
  }

  private processLine = (previousFrame: StackFrame, line: string): StackFrame => {
    const existingFrame = previousFrame.children.find((frame) => frame.name === line);
    if (existingFrame) {
      existingFrame.value += 1;
      return existingFrame;
    }

    const newFrame = {
      name: line,
      value: 1,
      children: [],
    };

    previousFrame.children.push(newFrame);
    return newFrame;
  };

  private processStackTrace = (root: StackFrame, stackTrace: string[]): void => {
    let previousFrame = root;

    for (const line of stackTrace.reverse()) {
      const currentFrame = this.processLine(previousFrame, line);
      previousFrame = currentFrame;
    }
  };

  private calculateChartData = (threads: Thread[]): StackFrame => {
    const root = {
      name: 'root',
      value: 0,
      children: [],
    };

    threads.forEach((thread) => (
      this.processStackTrace(root, thread.stackTrace)
    ));

    return root;
  };

  private filterThreads = (threadDumps: ThreadDump[]): Thread[] => {
    const threads: Thread[] = [];

    for (const threadDump of threadDumps) {
      for (const thread of threadDump.threads) {
        if (!this.state.withoutIdle || !isIdleThread(thread)) {
          threads.push(thread);
        }
      }
    }

    return threads;
  };

  public render(): JSX.Element {
    const { threadDumps } = this.props;
    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    const filteredThreads = this.filterThreads(threadDumps);
    const chartData: StackFrame = this.calculateChartData(filteredThreads);

    // todo: make details float over the chart
    return (
      <main className="full-width-page">
        <section id="heading">
          <FlameGraphSettings
            withoutIdle={this.state.withoutIdle}
            onFilterChange={this.handleFilterChange}
          />

          <div id="flame-chart-details" />
        </section>

        <FlameGraph chartData={chartData} />
      </main>
    );
  }
}
