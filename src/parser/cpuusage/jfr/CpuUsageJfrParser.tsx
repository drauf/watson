import { matchMultipleGroups, matchMultipleTimes } from '../../RegExpUtils';
import CpuUsageJfrTopColumnOffsets from './CpuUsageJfrTopColumnOffsets';
import { ParseCpuUsageCallback } from '../os/TopCpuUsageParser';
import CpuUsage from '../CpuUsage';
import ThreadCpuUsage from '../ThreadCpuUsage';

export const CPU_USAGE_JFR_FIRST_LINE_PATTERN = /^(JVM_THREAD_ID\s*OS_THREAD_ID\s*%CPU_USER_MODE\s*%CPU_SYSTEM_MODE\s*SYSTEM_TIME\s*THREAD_NAME)/;
const HEADER_COLUMN_MATCHER = /([^\s]+)[\s\n]*/g;
const DATA_COLUMN_MATCHER = /^\s*(\d+)\s*(\d+)\s*(\d+\.\d+%)\s*(\d+\.\d+%)\s+(\d+:\d+\.\d+)\s+(.*)\n?/;

export default class CpuUsageJfrParser {
  public static parseCpuUsage(fileName: string, lines: string[], callback: ParseCpuUsageCallback): void {
    // JVM_THREAD_ID OS_THREAD_ID %CPU_USER_MODE %CPU_SYSTEM_MODE  SYSTEM_TIME THREAD_NAME
    //           486         3315         24.84%            0.05%     16:39.04 Caesium-1-3
    //             7         3275         17.16%            0.22%     16:38.55 C2 CompilerThread1
    //             7         3381         13.06%            0.89%     16:38.58 C2 CompilerThread1
    const threadCpuUsages = CpuUsageJfrParser.parseThreadCpuUsages(lines);

    callback(CpuUsage.fromJfr(fileName, threadCpuUsages.length, threadCpuUsages));
  }

  private static parseThreadCpuUsages(lines: string[]): ThreadCpuUsage[] {
    const threadCpuUsages: ThreadCpuUsage[] = [];

    const offsets: CpuUsageJfrTopColumnOffsets = this.getColumnOffsets(lines[0]);

    lines
      .slice(1)
      .map((line) => matchMultipleGroups(DATA_COLUMN_MATCHER, line))
      .filter((columns) => columns.length >= offsets.getMaxIndex())
      .forEach((columns) => {
        const osThreadId = parseInt(columns[offsets.getOsThreadIdOffset()], 10);
        const cpuUserMode = parseFloat(columns[offsets.getCpuUserModeOffset()]);
        const cpuSystemMode = parseFloat(columns[offsets.getCpuSystemModeOffset()]);
        const systemTime = columns[offsets.getSystemTimeOffset()];
        threadCpuUsages.push(new ThreadCpuUsage(osThreadId, systemTime, cpuUserMode, cpuSystemMode));
      });

    return threadCpuUsages;
  }

  private static getColumnOffsets(header: string): CpuUsageJfrTopColumnOffsets {
    const offsets = new CpuUsageJfrTopColumnOffsets();

    // JVM_THREAD_ID OS_THREAD_ID %CPU_USER_MODE %CPU_SYSTEM_MODE SYSTEM_TIME THREAD_NAME
    const columns: string[] = matchMultipleTimes(HEADER_COLUMN_MATCHER, header);
    columns.forEach((columnName, index) => {
      switch (columnName) {
        case 'JVM_THREAD_ID':
          offsets.setJvmThreadIdOffset(index);
          break;
        case 'OS_THREAD_ID':
          offsets.setOsThreadIdOffset(index);
          break;
        case '%CPU_USER_MODE':
          offsets.setCpuUserModeOffset(index);
          break;
        case '%CPU_SYSTEM_MODE':
          offsets.setCpuSystemModeOffset(index);
          break;
        case 'SYSTEM_TIME':
          offsets.setSystemTimeOffset(index);
          break;
        case 'THREAD_NAME':
          offsets.setThreadNameOffset(index);
          break;
        default:
          break;
      }
    });
    return offsets;
  }
}
