import React from 'react';
import { flamegraph, StackFrame } from 'd3-flame-graph';
import * as d3 from 'd3';
import getColorForStackLine from '../../common/getColorForStackLine';

type Node = {
  data: {
    name: string
  }
};

type Props = {
  chartData: StackFrame;
};

export default class FlameGraph extends React.PureComponent<Props> {
  public componentDidMount(): void {
    const { chartData } = this.props;

    const chart = flamegraph()
      .width(window.innerWidth - 36)
      .sort(true)
      .inverted(true)
      .setDetailsElement(document.getElementById('flame-chart-details'))
      .setColorMapper((node: Node) => (getColorForStackLine(node.data.name)));

    d3.select('#flame-chart')
      .datum(chartData)
      .call(chart);
  }

  public render(): JSX.Element {
    return <div id="flame-chart" />;
  }
}
