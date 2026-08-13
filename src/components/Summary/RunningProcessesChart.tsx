import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, TooltipContentProps, XAxis, YAxis,
} from 'recharts';
import { token } from '@atlaskit/tokens';
import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import type { JSX } from 'react';
import ThreadDump from '../../types/ThreadDump';
import PopupContent from '../common/PopupContent';
import { getRunningProcessesTooltipData } from './runningProcessesTooltip';

interface Props {
  threadDumps: ThreadDump[];
}

interface RunningProcessesChartDatum {
  readonly name: string;
  readonly runningProcesses: number;
  readonly threads: ThreadDump['threads'];
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps): JSX.Element | null => {
  if (active && payload) {
    const time = label as string;
    const chartDatum = payload[0]?.payload as Partial<RunningProcessesChartDatum> | undefined;
    const { runningProcesses, threadNames } = getRunningProcessesTooltipData(
      chartDatum?.runningProcesses,
      chartDatum?.threads,
    );

    return (
      <PopupContent>
        <Text as="p">
          {`${time} - ${runningProcesses}`}
          {' '}
          running
          {' '}
          {runningProcesses === 1 ? 'process' : 'processes'}
          {' '}
          (from
          {' '}
          <i>top</i>
          )
        </Text>
        {threadNames.length > 0 && (
          <>
            <hr />
            <Text as="p">
              Top
              {' '}
              {threadNames.length}
              {' '}
              <i>jstack</i>
              {' '}
              threads:
            </Text>
            <ol>
              {threadNames.map((name) => <li key={name}>{name}</li>)}
            </ol>
          </>
        )}
      </PopupContent>
    );
  }

  return null;
};

const RunningProcessesChart = ({ threadDumps }: Props): JSX.Element => {
  const data: RunningProcessesChartDatum[] = [];

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
