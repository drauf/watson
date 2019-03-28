import React from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ThreadDump from '../../types/ThreadDump';

type RunningProcessesChartProps = {
  threadDumps: ThreadDump[];
};

const RunningProcessesChart: React.SFC<RunningProcessesChartProps> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map((threadDump) => {
    if (threadDump.loadAverages) {
      data.push({
        name: threadDump.date ? threadDump.date.toLocaleString() : null,
        runningProcesses: threadDump.runningProcesses,
      });
    }
  });

  return (
    <>
      <h3>Running processes</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" />
          <CartesianGrid stroke="#EBECF0" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line
            name="Running processes"
            dataKey="runningProcesses"
            stroke="#36B37E"
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default RunningProcessesChart;
