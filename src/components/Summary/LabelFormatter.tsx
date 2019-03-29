import { TooltipFormatter } from 'recharts';

// perform a "best effort" conversion to GBs
const labelFormatter: TooltipFormatter
  = (value: string | number | Array<string | number>): React.ReactNode => {
    return convert(value as number);
  };

const convert = (value: number): string => {
  if (value > 1000000) {
    return `${round(value / 1000000)} GB`;
  }
  return `${round(value / 1000)} MB`;
};

const round = (value: number): string => {
  return value.toFixed(2);
};

export default labelFormatter;
