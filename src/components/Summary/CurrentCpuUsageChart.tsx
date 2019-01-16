import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ThreadDump from '../../types/ThreadDump';

interface CurrentCpuUsageChartProps {
  threadDumps: ThreadDump[];
}

const CurrentCpuUsageChart: React.SFC<CurrentCpuUsageChartProps> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map(threadDump => {
    if (threadDump.currentCpuUsage) {
      data.push({
        name: threadDump.date ? threadDump.date.toLocaleString() : null,
        systemTime: threadDump.currentCpuUsage.systemTime,
        userTime: threadDump.currentCpuUsage.userTime
      })
    }
  })

  return (
    <>
      <h2>Current CPU usage</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" unit="%" domain={[0, 100]} />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="systemTime" stackId="1" stroke="#DE350B" fill="#FF5630" />
          <Area type="monotone" dataKey="userTime" stackId="1" stroke="#00A3BF" fill="#00B8D9" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

export default CurrentCpuUsageChart;
