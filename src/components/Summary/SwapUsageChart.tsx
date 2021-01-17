import React from 'react';
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadDump from '../../types/ThreadDump';
import labelFormatter from './LabelFormatter';

const COLORS = ['#6554C0', '#FF5630'];

type Props = {
  threadDumps: ThreadDump[];
};

const SwapUsageChart: React.FunctionComponent<Props> = ({ threadDumps }) => {
  const memoryUsages: MemoryUsage[] = threadDumps
    .map((threadDump) => threadDump.memoryUsage)
    .filter((memoryUsage) => !!memoryUsage);

  const freeSwapAvg = memoryUsages.reduce((a, b) => a + b.swapFree, 0) / memoryUsages.length;
  const usedSwapAvg = memoryUsages.reduce((a, b) => a + b.swapUsed, 0) / memoryUsages.length;

  // eslint-disable-next-line @typescript-eslint/ban-types
  const data: object[] = [
    { name: 'Free swap', value: freeSwapAvg },
    { name: 'Used swap', value: usedSwapAvg },
  ];

  return (
    <div>
      <h3>Swap usage</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name">
            {
              data.map((_, index) => <Cell key={COLORS[index]} fill={COLORS[index]} />)
            }
          </Pie>
          <Tooltip formatter={labelFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SwapUsageChart;
