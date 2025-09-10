// Performance configuration for async parsing
// Can be adjusted to optimize parsing speed vs UI responsiveness

export interface PerformanceConfig {
  // Processing chunk sizes
  threadDumpChunkSize: number;

  // Delays between chunks (ms)
  threadDumpProcessingDelay: number;
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  threadDumpChunkSize: 2_137,
  threadDumpProcessingDelay: 0,
};

export function getPerformanceConfig(): PerformanceConfig {
  return DEFAULT_PERFORMANCE_CONFIG;
}
