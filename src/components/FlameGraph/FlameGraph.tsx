import React from 'react';
import { select } from 'd3';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import getColorForStackLine from '../../common/getColorForStackLine';
import tooltip from './FlameGraphTooltip';

type NodeData = {
  name: string,
  value: number,
  fade: boolean
};

type Node = {
  data: NodeData
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
      .minFrameSize(5)
      .tooltip(tooltip)
      .setColorMapper((node: Node) => (getColorForStackLine(node.data.name, node.data.fade)));

    console.warn(chart.tooltip());

    select('#flame-graph')
      .datum(chartData)
      .call(chart);
  };

  public render(): JSX.Element {
    return <section id="flame-graph" />;
  }
}
