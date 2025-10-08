import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph, { ExtendedStackFrame } from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';
import { isIdleInSnapshot } from '../../common/threadFilters';

export type ParsedStackFrame = {
  rawFrame: string;
  rawClassName: string;
  cleanClassName: string;
  rawMethodName: string;
  cleanMethodName: string;
  packageName: string;
  line: string;
};

type State = {
  withoutIdle: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
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
  const lineNumber = lineInfo?.split(':')[1]?.replace(/[^0-9]/g, '');

  // Package name is everything except the last two parts (class and method)
  const packageName = parts.slice(0, -2).join('.');

  return {
    rawFrame: frame,
    rawClassName,
    cleanClassName,
    rawMethodName,
    cleanMethodName,
    packageName,
    line: lineNumber ? `line ${lineNumber}` : 'Unknown line',
  };
};

export const shortNameFrom = (parsedFrame: ParsedStackFrame): string => `${parsedFrame.cleanClassName}.${parsedFrame.cleanMethodName} @ ${parsedFrame.line}`;

class FlameGraphPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public override state = {
    withoutIdle: true,
    usingCpu: false,
    nameFilter: '',
    stackFilter: '',
  };

  private static processLine = (previousFrame: ExtendedStackFrame, line: string): ExtendedStackFrame => {
    const children = previousFrame.children as ExtendedStackFrame[];
    const existingFrame = children.find((frame) => frame.parsedStackFrame.rawFrame === line);
    if (existingFrame) {
      existingFrame.value += 1;
      return existingFrame;
    }

    const parsedStackFrame = parseStackFrame(line);
    const newFrame: ExtendedStackFrame = {
      name: shortNameFrom(parsedStackFrame),
      value: 1,
      children: [],
      parsedStackFrame,
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
      parsedStackFrame: {
        rawFrame: 'root',
        rawClassName: '',
        cleanClassName: '',
        rawMethodName: '',
        cleanMethodName: '',
        packageName: '',
        line: '',
      },
      fade: false,
    };

    threads.forEach((thread) => (
      FlameGraphPage.processStackTrace(root, [...thread.stackTrace])
    ));

    return root;
  };

  private filterThreads = (threadDumps: ThreadDump[]): Thread[] => {
    let threads: Thread[] = [];

    for (const threadDump of threadDumps) {
      for (const thread of threadDump.threads) {
        if (!this.state.withoutIdle || !isIdleInSnapshot(thread)) {
          threads.push(thread);
        }
      }
    }

    threads = FlameGraphPage.filterByName(threads, this.state.nameFilter);
    threads = FlameGraphPage.filterByStackTrace(threads, this.state.stackFilter);
    threads = FlameGraphPage.filterByCpuUsage(threads, this.state.usingCpu);

    return threads;
  };

  private static filterByName = (threads: Thread[], nameFilter: string): Thread[] => {
    if (!nameFilter) {
      return threads;
    }

    let userProvided: RegExp;
    try {
      userProvided = new RegExp(nameFilter, 'i');
    } catch {
      // ignore when user provides invalid RegExp
      return threads;
    }

    return threads.filter((thread) => userProvided.test(thread.name));
  };

  private static filterByStackTrace = (threads: Thread[], stackFilter: string): Thread[] => {
    if (!stackFilter) {
      return threads;
    }

    let userProvided: RegExp;
    try {
      userProvided = new RegExp(stackFilter, 'i');
    } catch {
      // ignore when user provides invalid RegExp
      return threads;
    }

    return threads.filter((thread) => FlameGraphPage.matchesStackTraceFilter(thread, userProvided));
  };

  private static filterByCpuUsage = (threads: Thread[], shouldFilter: boolean): Thread[] => {
    if (!shouldFilter) {
      return threads;
    }

    return threads.filter((thread) => parseFloat(thread.cpuUsage) >= 10);
  };

  private static matchesStackTraceFilter = (thread: Thread, filter: RegExp): boolean => {
    for (const line of thread.stackTrace) {
      if (filter.test(line)) {
        return true;
      }
    }
    return false;
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
          usingCpu={this.state.usingCpu}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onFilterChange={this.handleFilterChange}
          onRegExpChange={this.handleTextChange}
        />

        <FlameGraph chartData={chartData} />
      </main>
    );
  }
}

export default withThreadDumps(FlameGraphPage);
