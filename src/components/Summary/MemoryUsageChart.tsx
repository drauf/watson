import React from 'react';
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadDump from '../../types/ThreadDump';
import labelFormatter from './LabelFormatter';

const COLORS = ['#00B8D9', '#36B37E'];

type Props = {
  threadDumps: ThreadDump[];
};

const MemoryUsageChart: React.SFC<Props> = ({ threadDumps }) => {
  const memoryUsages: MemoryUsage[] = threadDumps
    .map((threadDump) => threadDump.memoryUsage)
    .filter((memoryUsage) => !!memoryUsage);

  const freeMemoryAvg = memoryUsages.reduce((a, b) => a + b.memoryFree, 0) / memoryUsages.length;
  const usedMemoryAvg = memoryUsages.reduce((a, b) => a + b.memoryUsed, 0) / memoryUsages.length;

  const data: object[] = [
    { name: 'Used memory', value: usedMemoryAvg },
    { name: 'Free memory', value: freeMemoryAvg },
  ];

  return (
    <div>
      <h3>Memory usage</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name">
            {
              data.map((_, index) => <Cell key={index} fill={COLORS[index]} />)
            }
          </Pie>
          <Tooltip formatter={labelFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemoryUsageChart;
