import { TooltipFormatter } from 'recharts';

// perform a "best effort" conversion to GBs
const labelFormatter: TooltipFormatter
  = (value: string | number | Array<string | number>): React.ReactNode => {
    const inGigabytes = convertToGigabytes(value as number);
    return `${inGigabytes} GB`;
  };

const convertToGigabytes = (value: number): string => {
  if (value > 1000000000) {
    return round(value / 1000000000);
  }
  if (value > 1000000) {
    return round(value / 1000000);
  }
  return round(value / 1000);
};

const round = (value: number): string => {
  return value.toFixed(2);
};

export default labelFormatter;
