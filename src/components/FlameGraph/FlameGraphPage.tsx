import { StackFrame } from 'd3-flame-graph';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';
import isIdleThread from '../../common/isIdleThread';

type State = {
  withoutIdle: boolean;
};

class FlameGraphPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);
    this.state = {
      withoutIdle: true,
    };
  }

  private static processLine = (previousFrame: StackFrame, line: string): StackFrame => {
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

  private static processStackTrace = (root: StackFrame, stackTrace: string[]): void => {
    let previousFrame = root;

    for (const line of stackTrace.reverse()) {
      const currentFrame = FlameGraphPage.processLine(previousFrame, line);
      previousFrame = currentFrame;
    }
  };

  private static calculateChartData = (threads: Thread[]): StackFrame => {
    const root = {
      name: 'root',
      value: 0,
      children: [],
    };

    threads.forEach((thread) => (
      FlameGraphPage.processStackTrace(root, [...thread.stackTrace])
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
    const chartData: StackFrame = FlameGraphPage.calculateChartData(filteredThreads);

    return (
      <main className="full-width-page">
        <FlameGraphSettings
          withoutIdle={this.state.withoutIdle}
          onFilterChange={this.handleFilterChange}
        />

        <FlameGraph chartData={chartData} />
      </main>
    );
  }
}

export default withThreadDumps(FlameGraphPage);
