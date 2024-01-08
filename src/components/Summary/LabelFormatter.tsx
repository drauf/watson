import MemoryUnit from "../../types/MemoryUnit";

const round = (value: number): string => value.toFixed(2);

const convertMiB = (value: number): string => {
  const valueInMB = value * 1.048576;
  const valueInGB = value * 0.001048576;

  if (valueInGB > 1) {
    return `${round(valueInGB)} GB`;
  }
  return `${round(valueInMB)} MB`;
};

const convertKiB = (value: number): string => {
  const valueInMB = value * 0.001024;
  const valueInGB = valueInMB / 1024;

  if (valueInGB > 1) {
    return `${round(valueInGB)} GB`;
  }
  return `${round(valueInMB)} MB`;
};

// perform a "best effort" conversion to GBs
export default function labelFormatter(value: string | number | Array<string | number>, unit: MemoryUnit): string {
  const numericValue = Number(value);
  return unit === MemoryUnit.MiB ? convertMiB(numericValue) : convertKiB(numericValue);
}
