import { matchOne } from './RegExpUtils';
import { CPU_USAGE_JFR_FIRST_LINE_PATTERN } from './cpuusage/jfr/CpuUsageJfrParser';
import { CPU_USAGE_TIMESTAMP_PATTERN } from './cpuusage/os/TopCpuUsageParser';

export type TextFileKind = 'jfr-cpu' | 'thread-dump' | 'top-cpu';

export function getTextFileKind(firstLine: string): TextFileKind {
  if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
    return 'top-cpu';
  }
  if (matchOne(CPU_USAGE_JFR_FIRST_LINE_PATTERN, firstLine)) {
    return 'jfr-cpu';
  }
  return 'thread-dump';
}
