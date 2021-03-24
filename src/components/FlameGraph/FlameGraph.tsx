import React from 'react';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import * as d3 from 'd3';

type Props = {
  chartData: StackFrame;
};

export default class FlameGraph extends React.PureComponent<Props> {
  public componentDidMount(): void {
    const { chartData } = this.props;

    // todo: color mapper, search, dynamic width
    const chart = flamegraph()
      .width(1600)
      .sort(true)
      .inverted(true)
      .setDetailsElement(document.getElementById('flame-chart-details'));

    d3.select('#flame-chart')
      .datum(chartData)
      .call(chart);
  }

  public render(): JSX.Element {
    return (
      <>
        <div id="flame-chart-details" />
        <div id="flame-chart" />
      </>
    );
  }
}
