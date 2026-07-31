import React from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, TooltipContentProps, XAxis, YAxis,
} from 'recharts';
import { token } from '@atlaskit/tokens';
import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import ThreadDump from '../../types/ThreadDump';
import PopupContent from '../common/PopupContent';

interface Props {
  threadDumps: ThreadDump[];
}

interface ChartData {
  fifteenMinutes: number;
  fiveMinutes: number;
  name: string;
  oneMinute: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps): JSX.Element | null => {
  if (active && payload) {
    return (
      <PopupContent>
        <Text as="p">
          Load averages at
          {' '}
          {label}
          :
        </Text>

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
      </PopupContent>
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
          <Heading as="h3" size="medium">Load averages</Heading>
          <Text as="p">No data</Text>
        </div>
      );
    }

    return (
      <div id="load-averages-chart" className="chart">
        <Heading as="h3" size="medium">Load averages</Heading>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis type="number" />
            <CartesianGrid stroke={token('color.chart.neutral')} strokeDasharray="5 5" />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Line name="One minute" dataKey="oneMinute" stroke={token('color.chart.categorical.1')} isAnimationActive={false} />
            <Line name="Five minutes" dataKey="fiveMinutes" stroke={token('color.chart.categorical.2')} isAnimationActive={false} />
            <Line name="Fifteen minutes" dataKey="fifteenMinutes" stroke={token('color.chart.categorical.3')} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
