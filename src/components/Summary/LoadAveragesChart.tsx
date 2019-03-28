import React from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ThreadDump from '../../types/ThreadDump';

type Props = {
  threadDumps: ThreadDump[];
};

const LoadAveragesChart: React.SFC<Props> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map((threadDump) => {
    if (threadDump.loadAverages) {
      data.push({
        fifteenMinutes: threadDump.loadAverages.fifteenMinutes,
        fiveMinutes: threadDump.loadAverages.fiveMinutes,
        name: threadDump.date ? threadDump.date.toLocaleString() : null,
        oneMinute: threadDump.loadAverages.oneMinute,
      });
    }
  });

  return (
    <>
      <h3>Load averages</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line name="One minute" dataKey="oneMinute" stroke="#36B37E" />
          <Line name="Five minutes" dataKey="fiveMinutes" stroke="#FFAB00" />
          <Line name="Fifteen minutes" dataKey="fifteenMinutes" stroke="#6554C0" />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default LoadAveragesChart;
