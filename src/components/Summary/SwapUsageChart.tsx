import React from 'react';
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ThreadDump from '../../types/ThreadDump';

type SwapUsageChartProps = {
  threadDumps: ThreadDump[];
};

const SwapUsageChart: React.SFC<SwapUsageChartProps> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map((threadDump) => {
    if (threadDump.memoryUsage) {
      data.push({
        name: threadDump.date ? threadDump.date.toLocaleString() : null,
        swapFree: (threadDump.memoryUsage.swapFree / 1000000).toFixed(2),
        swapUsed: (threadDump.memoryUsage.swapUsed / 1000000).toFixed(2),
      });
    }
  });

  return (
    <>
      <h2>Swap usage</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" unit="GB" domain={[0, dataMax => dataMax.toFixed(2)]} />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="swapUsed" stackId="1" stroke="#DE350B" fill="#FF5630" />
          <Area type="monotone" dataKey="swapFree" stackId="1" stroke="#5243AA" fill="#6554C0" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default SwapUsageChart;
