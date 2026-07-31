import React, { type JSX } from 'react';
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import { token } from '@atlaskit/tokens';
import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadDump from '../../types/ThreadDump';
import labelFormatter from './LabelFormatter';
import PieChartTooltip, { ChartData } from './PieChartTooltip';

const COLORS = [token('color.chart.categorical.4'), token('color.chart.categorical.3')];

interface Props {
  threadDumps: ThreadDump[];
}

export default class SwapUsageChart extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { threadDumps } = this.props;

    const memoryUsages: MemoryUsage[] = threadDumps
      .map((threadDump) => threadDump.memoryUsage)
      .filter((memoryUsage) => memoryUsage !== undefined);

    if (memoryUsages.length === 0) {
      return (
        <div className="chart">
          <Heading as="h3" size="medium">Swap usage</Heading>
          <Text as="p">No data</Text>
        </div>
      );
    }

    const { memoryUnit } = memoryUsages[0];
    const freeSwapAvg = memoryUsages.reduce((a, b) => a + b.swapFree, 0) / memoryUsages.length;
    const usedSwapAvg = memoryUsages.reduce((a, b) => a + b.swapUsed, 0) / memoryUsages.length;
    const sum = freeSwapAvg + usedSwapAvg;

    const data: ChartData[] = [
      { name: 'Free swap', value: freeSwapAvg, label: labelFormatter(freeSwapAvg, memoryUnit) },
      { name: 'Used swap', value: usedSwapAvg, label: labelFormatter(usedSwapAvg, memoryUnit) },
    ];

    return (
      <div id="swap-usage-chart">
        <Heading as="h3" size="medium">Swap usage</Heading>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" isAnimationActive={false}>
              {
                data.map((_, index) => <Cell key={COLORS[index]} fill={COLORS[index]} />)
              }
            </Pie>
            {sum === 0 && (
              <Pie data={[{ name: 'No Data', value: 1 }]} dataKey="value" fill={token('color.chart.neutral')} isAnimationActive={false} />
            )}
            {sum !== 0 && <Tooltip content={PieChartTooltip} />}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
