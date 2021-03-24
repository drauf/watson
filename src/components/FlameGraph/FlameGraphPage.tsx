import React from 'react';
import { StackFrame } from 'd3-flame-graph';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';
import FlameGraph from './FlameGraph';
import './FlameGraphPage.css';

type State = {
  chartData?: StackFrame;
};

export default class FlameGraphPage extends React.PureComponent<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);
    this.state = {};
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

    for (const line of stackTrace) {
      // todo: collapse "boring" lines to make chart's height manageable
      const currentFrame = this.processLine(previousFrame, line);
      previousFrame = currentFrame;
    }
  };

  private calculateChartData = (threadDumps: ThreadDump[]): StackFrame => {
    const root = {
      name: 'root',
      value: 0,
      children: [],
    };

    threadDumps.forEach((threadDump) => (
      threadDump.threads.forEach((thread) => (
        this.processStackTrace(root, thread.stackTrace)
      ))
    ));

    return root;
  };

  public render(): JSX.Element {
    const { threadDumps } = this.props;
    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    // todo: filter out non-active threads before passing them down
    const chartData: StackFrame = this.calculateChartData(threadDumps);

    return (
      <main>
        <FlameGraph chartData={chartData} />
      </main>
    );
  }
}
