import React from 'react';
import { select } from 'd3';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import getColorForStackLine from '../../common/getColorForStackLine';
import tooltip from './FlameGraphTooltip';
import type { ParsedStackFrame } from './FlameGraphPage';

export type ExtendedStackFrame = StackFrame & {
  parsedStackFrame: ParsedStackFrame,
  fade: boolean,
};

export type Node = {
  data: ExtendedStackFrame,
  parent: Node | null,
  value: number
};

type Props = {
  chartData: ExtendedStackFrame;
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
      .sort(true)
      .inverted(true)
      .minFrameSize(5)
      .transitionDuration(500)
      .tooltip(tooltip)
      .setColorMapper((node: Node) => (getColorForStackLine(node.data.parsedStackFrame.rawFrame, node.data.fade)));

    select('#flame-graph')
      .datum(chartData)
      .call(chart);
  };

  public override render(): JSX.Element {
    return <section id="flame-graph" />;
  }
}
