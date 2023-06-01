const round = (value: number): string => value.toFixed(2);

const convert = (value: number): string => {
  if (value > 1000000) {
    return `${round(value / 1000000)} GB`;
  }
  return `${round(value / 1000)} MB`;
};

// perform a "best effort" conversion to GBs
export default function
labelFormatter(value: string | number | Array<string | number>): string {
  return convert(value as number);
}
