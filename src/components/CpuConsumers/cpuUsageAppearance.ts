export type CpuUsageAppearance = 'danger' | 'warning' | 'primary' | 'default';
export type CpuUsageLozengeAppearance = 'danger' | 'warning' | 'information' | 'neutral';

// The numbers here are completely arbitrary
const HIGH_CPU_USAGE_THRESHOLD = 78;
const MEDIUM_CPU_USAGE_THRESHOLD = 42;
const LOW_CPU_USAGE_THRESHOLD = 10;

const getCpuUsageAppearance = (cpuUsage: number): CpuUsageAppearance => {
  if (cpuUsage > HIGH_CPU_USAGE_THRESHOLD) {
    return 'danger';
  }
  if (cpuUsage > MEDIUM_CPU_USAGE_THRESHOLD) {
    return 'warning';
  }
  if (cpuUsage > LOW_CPU_USAGE_THRESHOLD) {
    return 'primary';
  }
  return 'default';
};

export const getCpuUsageLozengeAppearance = (cpuUsage: number): CpuUsageLozengeAppearance => {
  if (cpuUsage > HIGH_CPU_USAGE_THRESHOLD) {
    return 'danger';
  }
  if (cpuUsage > MEDIUM_CPU_USAGE_THRESHOLD) {
    return 'warning';
  }
  if (cpuUsage > LOW_CPU_USAGE_THRESHOLD) {
    return 'information';
  }
  return 'neutral';
};

export default getCpuUsageAppearance;
