import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph, { ExtendedStackFrame } from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';
import isIdleThread from '../../common/isIdleThread';

type ParsedStackFrame = {
  rawClassName: string;
  cleanClassName: string;
  rawMethodName: string;
  cleanMethodName: string;
  packageName: string;
  lineNumber: string | null;
};

type State = {
  withoutIdle: boolean;
};

export const parseStackFrame = (frame: string): ParsedStackFrame => {
  // Split "com.example.Class.method(File.java:123)" into method and location parts
  const [fullName, lineInfo] = frame.split('(');
  const parts = fullName.split('.');

  // Extract class name, handling special cases like lambdas and proxies
  const rawClassName = parts[parts.length - 2] || '';
  const cleanClassName = rawClassName
    .replace(/\$+Lambda\$\d+.*/, '')
    .replace(/\$Proxy\d+/, 'Proxy');

  // Extract method name, cleaning up lambda syntax
  const rawMethodName = parts[parts.length - 1];
  const cleanMethodName = rawMethodName
    .replace(/lambda\$(\w+)\$\d+/, '$1');

  // Get line number, defaulting to null if not present
  const lineNumber = lineInfo?.split(':')[1]?.replace(/[^0-9]/g, '') || null;

  // Package name is everything except the last two parts (class and method)
  const packageName = parts.slice(0, -2).join('.');

  return {
    rawClassName,
    cleanClassName,
    rawMethodName,
    cleanMethodName,
    packageName,
    lineNumber,
  };
};

export const shortNameFrom = (frame: string): string => {
  const parsed = parseStackFrame(frame);

  if (!parsed.lineNumber) {
    return `${parsed.cleanClassName}.${parsed.cleanMethodName} @ Unknown line`;
  }
  return `${parsed.cleanClassName}.${parsed.cleanMethodName} @ line ${parsed.lineNumber}`;
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
