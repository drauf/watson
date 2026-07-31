import { TooltipContentProps } from 'recharts';
import PopupContent from '../common/PopupContent';

export interface ChartData {
  name: string;
  value: number;
  label: string;
}

const PieChartTooltip = ({ active, payload }: TooltipContentProps): JSX.Element | null => {
  if (active && payload) {
    const { name, label } = payload[0].payload as ChartData;

    return (
      <PopupContent>
        {name}
        :
        {' '}
        {label}
      </PopupContent>
    );
  }

  return null;
};

export default PieChartTooltip;
