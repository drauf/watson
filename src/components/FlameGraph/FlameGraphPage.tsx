import React from 'react';
import * as d3 from 'd3';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import ThreadDump from '../../types/ThreadDump';

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

  public componentDidUpdate(): void {
    const { chartData } = this.state;

    // to check: color mapper, search
    const chart = flamegraph()
      .width(1600)
      .sort(true)
      .inverted(true)
      .setDetailsElement(document.getElementById('details'));

    d3.select('#chart')
      .datum(chartData)
      .attr('width', 600)
      .call(chart);
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
        <div id="details" />
        <div id="chart" />
      </main>
    );
  }
}
