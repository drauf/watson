import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, TooltipContentProps, XAxis, YAxis,
} from 'recharts';
import { token } from '@atlaskit/tokens';
import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import type { JSX } from 'react';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';
import PopupContent from '../common/PopupContent';

interface Props {
  threadDumps: ThreadDump[];
}

const getSortedThreadNames = (payload: unknown): string[] => {
  const threads: Thread[] = payload as Thread[];

  return threads
    .filter((thread) => thread.status === ThreadStatus.RUNNABLE)
    .filter((thread) => thread.cpuUsage !== '0.00')
    .sort((a, b) => parseFloat(b.cpuUsage) - parseFloat(a.cpuUsage))
    .slice(0, 10)
    .map((thread) => `${thread.cpuUsage}% CPU - ${thread.name}`);
};

const CustomTooltip = ({ active, payload, label }: TooltipContentProps): JSX.Element | null => {
  if (active && payload) {
    const time = label as string;
    const threadNames: string[] = getSortedThreadNames(payload[1].value);
    const threadsCount: number = payload[0].value ? Number(payload[0].value) : 0;

    return (
      <PopupContent>
        <Text as="p">
          {`${time} - ${threadsCount}`}
          {' '}
          running
          {' '}
          {threadsCount === 1 ? 'process' : 'processes'}
          {' '}
          (from
          {' '}
          <i>top</i>
          )
        </Text>
        <hr />
        <Text as="p">
          Top 10
          {' '}
          <i>jstack</i>
          {' '}
          threads:
        </Text>
        <ol>
          {threadNames.length > 0
            ? threadNames.map((name) => <li key={name}>{name}</li>)
            : <li>none</li>}
        </ol>
      </PopupContent>
    );
  }

  return null;
};

const RunningProcessesChart = ({ threadDumps }: Props): JSX.Element => {
  const data: object[] = [];

  threadDumps.forEach((threadDump) => {
    if (threadDump.threads.some((thread) => thread.cpuUsage !== '0.00')) {
      data.push({
        name: ThreadDump.getFormattedTime(threadDump),
        runningProcesses: threadDump.runningProcesses,
        threads: threadDump.threads,
      });
    }
  });

  if (data.length === 0) {
    return (
      <div className="chart">
        <Heading as="h3" size="medium">Running processes</Heading>
        <Text as="p">No data</Text>
      </div>
    );
  }

  return (
    <div id="running-processes-chart" className="chart">
      <Heading as="h3" size="medium">Running processes</Heading>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis type="number" allowDecimals={false} />
          <CartesianGrid stroke={token('color.chart.neutral')} strokeDasharray="5 5" />
          <Tooltip content={CustomTooltip} />
          <Line
            name="Chart data"
            dataKey="runningProcesses"
            stroke={token('color.text.accent.lime')}
            isAnimationActive={false}
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

export default RunningProcessesChart;
