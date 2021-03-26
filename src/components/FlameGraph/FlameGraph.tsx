import React from 'react';
import * as d3 from 'd3';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import getColorForStackLine from '../../common/getColorForStackLine';

type Node = {
  data: {
    name: string,
    value: number
  }
};

type Props = {
  chartData: StackFrame;
};

export default class FlameGraph extends React.PureComponent<Props> {
  public componentDidMount(): void {
    this.renderChart();
  }

  public componentDidUpdate(): void {
    this.renderChart();
  }

  private renderChart = (): void => {
    const { chartData } = this.props;

    const chart = flamegraph()
      .width(window.innerWidth - 36)
      .sort(true)
      .inverted(true)
      .setColorMapper((node: Node) => (getColorForStackLine(node.data.name)));

    d3.select('#flame-graph')
      .datum(chartData)
      .call(chart);
  };

  public render(): JSX.Element {
    return <section id="flame-graph" />;
  }
}
