import React from 'react';
import { select } from 'd3';
import flamegraph, { StackFrame, ChartNode } from 'd3-flame-graph';
import getColorForStackLine from '../../common/getColorForStackLine';
import tooltip from './FlameGraphTooltip';

type Props = {
  chartData: StackFrame;
};

export default class FlameGraph extends React.PureComponent<Props> {
  public override componentDidMount(): void {
    this.renderChart();
  }

  public override componentDidUpdate(): void {
    this.renderChart();
  }

  private renderChart = (): void => {
    const { chartData } = this.props;

    const chart = flamegraph()
      .width(window.innerWidth - 36)
      .cellHeight(22)
      // from biggest to smallest groups of frames
      .sort((a: StackFrame, b: StackFrame) => b.value - a.value)
      .inverted(true)
      .minFrameSize(5)
      .transitionDuration(200)
      .tooltip(tooltip)
      .setColorMapper((node: ChartNode) => (getColorForStackLine(node.data.parsedStackFrame.rawFrame, node.data.fade)));

    select('#flame-graph')
      .datum(chartData)
      .call(chart);
  };

  public override render(): JSX.Element {
    return <section id="flame-graph" />;
  }
}
