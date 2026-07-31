import { StackFrame } from 'd3-flame-graph';
import type { JSX } from 'react';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import { filterFlameGraphThreads, FlameGraphFilters } from './flameGraphFiltering';
import EmptyState from '../Errors/EmptyState';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import FlameGraph from './FlameGraph';
import PageWithSettings from '../PageWithSettings';
import FlameGraphSettings from './FlameGraphSettings';
import './FlameGraphPage.css';
import Thread from '../../types/Thread';

export interface ParsedStackFrame {
  rawFrame: string;
  rawClassName: string;
  cleanClassName: string;
  rawMethodName: string;
  cleanMethodName: string;
  packageName: string;
  line: string;
}

interface State {
  withoutIdle: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
}

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

  private static processLine = (previousFrame: StackFrame, line: string): StackFrame => {
    const existingFrame = previousFrame.children.find((frame) => frame.parsedStackFrame.rawFrame === line);
    if (existingFrame) {
      existingFrame.value += 1;
      return existingFrame;
    }

    const parsedStackFrame = parseStackFrame(line);
    const newFrame: StackFrame = {
      name: shortNameFrom(parsedStackFrame),
      value: 1,
      children: [],
      parsedStackFrame,
      fade: false,
    };

    previousFrame.children.push(newFrame);
    return newFrame;
  };

  private static processStackTrace = (root: StackFrame, stackTrace: string[]): void => {
    let previousFrame: StackFrame = root;

    for (const line of stackTrace.reverse()) {
      const currentFrame = FlameGraphPage.processLine(previousFrame, line);
      previousFrame = currentFrame;
    }
  };

  private static calculateChartData = (threads: Thread[]): StackFrame => {
    const root: StackFrame = {
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

  public override render(): JSX.Element {
    const { threadDumps } = this.props;
    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    const filters: FlameGraphFilters = this.state;
    const filteredThreads = filterFlameGraphThreads(threadDumps, filters);
    const chartData: StackFrame = FlameGraphPage.calculateChartData(filteredThreads);

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

        {chartData.children.length === 0 ? (
          <EmptyState />
        ) : (
          <FlameGraph chartData={chartData} />
        )}
      </main>
    );
  }
}

export default withThreadDumps(FlameGraphPage);
