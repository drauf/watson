import React from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis,
} from 'recharts';
import ThreadDump from '../../types/ThreadDump';
import TooltipContent from '../common/TooltipContent';

type Props = {
  threadDumps: ThreadDump[];
};

type ChartData = {
  fifteenMinutes: number;
  fiveMinutes: number;
  name: string;
  oneMinute: number;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<string, string>): JSX.Element | null => {
  if (active && payload) {
    return (
      <TooltipContent>
        <p>
          Load averages at
          {' '}
          {label}
          :
        </p>

        <ul>
          {payload.map((item) => (
            <li key={item.name} style={{ color: item.color }}>
              {item.name}
              :
              {' '}
              {item.value}
            </li>
          ))}
        </ul>
      </TooltipContent>
    );
  }

  return null;
};

export default class LoadAveragesChart extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { threadDumps } = this.props;

    const data: ChartData[] = [];
    threadDumps.forEach((threadDump) => {
      if (threadDump.loadAverages) {
        data.push({
          fifteenMinutes: threadDump.loadAverages.fifteenMinutes,
          fiveMinutes: threadDump.loadAverages.fiveMinutes,
          name: ThreadDump.getFormattedTime(threadDump),
          oneMinute: threadDump.loadAverages.oneMinute,
        });
      }
    });

    if (data.length === 0) {
      return (
        <div className="chart">
          <h3>Load averages</h3>
          <p>No data</p>
        </div>
      );
    }

    return (
      <div id="load-averages-chart" className="chart">
        <h3>Load averages</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis type="number" />
            <CartesianGrid stroke="#DFE1E5" strokeDasharray="5 5" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line name="One minute" dataKey="oneMinute" stroke="#36B37E" animationDuration={1000} />
            <Line name="Five minutes" dataKey="fiveMinutes" stroke="#FFAB00" animationDuration={1000} />
            <Line name="Fifteen minutes" dataKey="fifteenMinutes" stroke="#6554C0" animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
