import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ThreadDump from '../../types/ThreadDump';

type MemoryUsageChartProps = {
  threadDumps: ThreadDump[];
}

const MemoryUsageChart: React.SFC<MemoryUsageChartProps> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map(threadDump => {
    if (threadDump.memoryUsage) {
      data.push({
        memoryFree: (threadDump.memoryUsage.memoryFree / 1000000).toFixed(2),
        memoryUsed: (threadDump.memoryUsage.memoryUsed / 1000000).toFixed(2),
        name: threadDump.date ? threadDump.date.toLocaleString() : null
      })
    }
  })

  return (
    <>
      <h2>Memory usage</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" unit="GB" domain={[0, dataMax => dataMax.toFixed(2)]} />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="memoryUsed" stackId="1" stroke="#00A3BF" fill="#00B8D9" />
          <Area type="monotone" dataKey="memoryFree" stackId="1" stroke="#00875A" fill="#36B37E" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

export default MemoryUsageChart;
