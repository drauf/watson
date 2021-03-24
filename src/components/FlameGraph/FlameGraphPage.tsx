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

  public componentDidMount(): void {
    const { threadDumps } = this.props;
    const chartData: StackFrame = this.calculateChartData(threadDumps);
    this.setState({ chartData });
  }

  private calculateChartData = (threadDumps: ThreadDump[]): StackFrame => (
    {
      name: 'name',
      value: 200,
      children: [
        {
          name: 'child',
          value: 100,
          children: [],
        },
      ],
    }
  );

  public render(): JSX.Element {
    const { threadDumps } = this.props;
    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    const { chartData } = this.state;
    if (!chartData) {
      return (
        <main id="centered">
          <h4>Calculating chart data...</h4>
        </main>
      );
    }

    return (
      <main>
        <FlameGraph chartData={chartData} />
      </main>
    );
  }
}
