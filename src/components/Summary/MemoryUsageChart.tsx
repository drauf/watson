import React from 'react';
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadDump from '../../types/ThreadDump';
import labelFormatter from './LabelFormatter';
import PieChartTooltip, { ChartData } from './PieChartTooltip';

const COLORS = ['#00B8D9', '#36B37E'];

type Props = {
  threadDumps: ThreadDump[];
};

export default class MemoryUsageChart extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { threadDumps } = this.props;

    const memoryUsages: MemoryUsage[] = threadDumps
      .map((threadDump) => threadDump.memoryUsage)
      .filter((memoryUsage) => memoryUsage !== undefined);

    if (memoryUsages.length === 0) {
      return (
        <div className="chart">
          <h3>Memory usage</h3>
          <p>No data</p>
        </div>
      );
    }

    const { memoryUnit } = memoryUsages[0];
    const freeMemoryAvg = memoryUsages.reduce((a, b) => a + b.memoryFree, 0) / memoryUsages.length;
    const usedMemoryAvg = memoryUsages.reduce((a, b) => a + b.memoryUsed, 0) / memoryUsages.length;
    const sum = freeMemoryAvg + usedMemoryAvg;

    const data: ChartData[] = [
      { name: 'Used memory', value: usedMemoryAvg, label: labelFormatter(usedMemoryAvg, memoryUnit) },
      { name: 'Free memory', value: freeMemoryAvg, label: labelFormatter(freeMemoryAvg, memoryUnit) },
    ];

    return (
      <div>
        <h3>Memory usage</h3>
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
