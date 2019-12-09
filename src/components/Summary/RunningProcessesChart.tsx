import React from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ThreadDump from '../../types/ThreadDump';

type Props = {
  threadDumps: ThreadDump[];
};

const RunningProcessesChart: React.SFC<Props> = ({ threadDumps }) => {
  const data: object[] = [];
  threadDumps.map((threadDump) => {
    if (threadDump.loadAverages) {
      data.push({
        name: ThreadDump.getFormattedTime(threadDump),
        runningProcesses: threadDump.runningProcesses,
      });
    }
  });

  return (
    <div className="chart">
      <h3>Running processes</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" />
          <CartesianGrid stroke="#DFE1E5" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line
            name="Running processes"
            dataKey="runningProcesses"
            stroke="#36B37E"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RunningProcessesChart;
