import Thread from '../../types/Thread';

export interface CpuUsageSummary {
  mean: number;
  median: number;
  max: number;
}

export const getCpuUsageSummary = (threads: Iterable<Thread>, dumpsNumber: number): CpuUsageSummary => {
  const values = Array.from(threads, (thread) => parseFloat(thread.cpuUsage));
  const sortedValues = values.slice().sort((left, right) => left - right);
  const lowMiddle = Math.floor((sortedValues.length - 1) / 2);
  const highMiddle = Math.ceil((sortedValues.length - 1) / 2);

  return {
    mean: values.reduce((sum, value) => sum + value, 0) / dumpsNumber,
    median: (sortedValues[lowMiddle] + sortedValues[highMiddle]) / 2,
    max: Math.max(...values),
  };
};
