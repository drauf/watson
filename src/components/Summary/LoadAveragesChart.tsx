import * as React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ThreadDump from '../../types/ThreadDump';

interface LoadAveragesChartProps {
  threadDumps: ThreadDump[];
}

const LoadAveragesChart: React.SFC<LoadAveragesChartProps> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map(threadDump => {
    if (threadDump.loadAverages) {
      data.push({
        fifteenMinutes: threadDump.loadAverages.fifteenMinutes,
        fiveMinutes: threadDump.loadAverages.fiveMinutes,
        name: threadDump.date ? threadDump.date.toLocaleString() : null,
        oneMinute: threadDump.loadAverages.oneMinute
      })
    }
  })

  return (
    <>
      <h2>Load averages</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" unit="%" domain={[0, 100]} />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="oneMinute" stroke="#36B37E" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="fiveMinutes" stroke="#FFAB00" />
          <Line type="monotone" dataKey="fifteenMinutes" stroke="#6554C0" />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

export default LoadAveragesChart;
