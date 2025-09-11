import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph, { ExtendedStackFrame } from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';
import isIdleThread from '../../common/isIdleThread';

type State = {
  withoutIdle: boolean;
};

export const shortNameFrom = (frame: string): string => {
  // Split into class+method and line info
  const [fullName, lineInfo] = frame.split('(');
  // Get class parts
  const parts = fullName.split('.');
  // Get clean class name (last meaningful part)
  let className = parts[parts.length - 2] || '';

  className = className
    .replace(/\$\$Lambda\$\d+.*/, '') // remove Lambda numbers and hex
    .replace(/\$Proxy\d+/, 'Proxy'); // clean up proxy names

  // Get method name and clean up lambda syntax
  const methodName = parts[parts.length - 1]
    .replace(/lambda\$(\w+)\$\d+/, '$1'); // convert "lambda$processClaimedItem$4" to "processClaimedItem"

  // Clean up line info
  const lineNumber = lineInfo?.split(':')[1]?.replace(/[^0-9]/g, '') || '';

  if (!lineNumber) {
    return `${className}.${methodName} @ Unknown line`;
  }
  return `${className}.${methodName} @ line ${lineNumber}`;
};

class FlameGraphPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);
    this.state = {
      withoutIdle: true,
    };
  }

  private static processLine = (previousFrame: ExtendedStackFrame, line: string): ExtendedStackFrame => {
    const children = previousFrame.children as ExtendedStackFrame[];
    const existingFrame = children.find((frame) => frame.fullFrame === line);
    if (existingFrame) {
      existingFrame.value += 1;
      return existingFrame;
    }

    const newFrame: ExtendedStackFrame = {
      name: shortNameFrom(line),
      value: 1,
      children: [],
      fullFrame: line,
      fade: false,
    };

    previousFrame.children.push(newFrame);
    return newFrame;
  };

  private static processStackTrace = (root: ExtendedStackFrame, stackTrace: string[]): void => {
    let previousFrame: ExtendedStackFrame = root;

    for (const line of stackTrace.reverse()) {
      const currentFrame = FlameGraphPage.processLine(previousFrame, line);
      previousFrame = currentFrame;
    }
  };

  private static calculateChartData = (threads: Thread[]): ExtendedStackFrame => {
    const root: ExtendedStackFrame = {
      name: 'root',
      value: 0,
      children: [],
      fullFrame: 'root',
      fade: false,
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

  public override render(): JSX.Element {
    const { threadDumps } = this.props;
    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    const filteredThreads = this.filterThreads(threadDumps);
    const chartData: ExtendedStackFrame = FlameGraphPage.calculateChartData(filteredThreads);

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
