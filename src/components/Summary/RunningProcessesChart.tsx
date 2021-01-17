import React from 'react';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis,
} from 'recharts';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';

type Props = {
  threadDumps: ThreadDump[];
};

const RunningProcessesChart: React.FunctionComponent<Props> = ({ threadDumps }) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const data: object[] = [];

  threadDumps.forEach((threadDump) => {
    if (threadDump.loadAverages) {
      data.push({
        name: ThreadDump.getFormattedTime(threadDump),
        runningProcesses: threadDump.runningProcesses,
        threads: threadDump.threads,
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
          <Tooltip content={<CustomTooltip />} />
          <Line
            name="Chart data"
            dataKey="runningProcesses"
            stroke="#36B37E"
          />
          <Line
            name="Tooltip data"
            dataKey="threads"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip: React.FunctionComponent<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload) {
    const threadNames: string[] = getSortedThreadNames(payload[1].value);

    return (
      <div className="tooltip ellipsis">
        <p>
          {`${label} - ${payload[0].value}`}
          {' '}
          running processes (from
          <i>top</i>
          )
        </p>

        Top 10
        {' '}
        <i>jstack</i>
        {' '}
        threads:
        <ol>
          {threadNames.length > 0
            ? threadNames.map((name) => <li key={name}>{name}</li>)
            : <li>none</li>}
        </ol>
      </div>
    );
  }

  return null;
};

const getSortedThreadNames = (payload: unknown): string[] => {
  const threads: Thread[] = payload as Thread[];

  return threads
    .filter((thread) => thread.status === ThreadStatus.RUNNABLE)
    .filter((thread) => thread.cpuUsage > 0)
    .sort((a, b) => b.cpuUsage - a.cpuUsage)
    .slice(0, 10)
    .map((thread) => `${thread.cpuUsage}% CPU - ${thread.name}`);
};

export default RunningProcessesChart;
