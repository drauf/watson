import { TooltipProps } from 'recharts';
import TooltipContent from '../common/TooltipContent';

export type ChartData = {
  name: string;
  value: number;
  label: string;
};

const PieChartTooltip = ({ active, payload }: TooltipProps<string, string>): JSX.Element | null => {
  if (active && payload) {
    const { name, label } = payload[0].payload as ChartData;

    return (
      <TooltipContent>
        {name}
        :
        {' '}
        {label}
      </TooltipContent>
    );
  }

  return null;
};

export default PieChartTooltip;
