import React from 'react';
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadDump from '../../types/ThreadDump';
import labelFormatter from './LabelFormatter';
import PieChartTooltip, { ChartData } from './PieChartTooltip';

const COLORS = ['#6554C0', '#FF5630'];

type Props = {
  threadDumps: ThreadDump[];
};

export default class SwapUsageChart extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { threadDumps } = this.props;

    const memoryUsages: MemoryUsage[] = threadDumps
      .map((threadDump) => threadDump.memoryUsage)
      .filter((memoryUsage) => memoryUsage !== undefined);

    if (memoryUsages.length === 0) {
      return (
        <div className="chart">
          <h3>Swap usage</h3>
          <p>No data</p>
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
      <div>
        <h3>Swap usage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" animationDuration={1000}>
              {
                data.map((_, index) => <Cell key={COLORS[index]} fill={COLORS[index]} />)
              }
            </Pie>
            {sum === 0 && (
              <Pie data={[{ name: 'No Data', value: 1 }]} dataKey="value" fill="#eeeeee" animationDuration={1000} />
            )}
            {sum !== 0 && <Tooltip content={<PieChartTooltip />} />}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
