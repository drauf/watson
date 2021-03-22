import CpuUsage from './CpuUsage';
import LoadAverages from '../types/LoadAverage';
import MemoryUsage from '../types/MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';
import { matchMultipleGroups, matchMultipleTimes, matchOne } from './RegExpUtils';
import TopColumnOffsets from './TopColumnOffsets';

export const CPU_USAGE_TIMESTAMP_PATTERN = /^top - ([0-9]{2}:[0-9]{2}:[0-9]{2})/;
const LOAD_AVERAGES_PATTERN = / load average: ([0-9.]+), ([0-9.]+), ([0-9.]+)/;
const RUNNING_PROCESSES_PATTERN = /([0-9.]+) running/;
const TOTAL_MEMORY_PATTERN = /([0-9.]+)k?[ +]total/;
const USED_MEMORY_PATTERN = /([0-9.]+)k? used/;
const FREE_MEMORY_PATTERN = /([0-9.]+)k? free/;
const COLUMN_MATCHER = /([^\s]+) +/g;

export type ParseCpuUsageCallback = (cpuUsage: CpuUsage) => void;

export default class CpuUsageParser {
  public static parseCpuUsage(lines: string[], callback: ParseCpuUsageCallback): void {
    const timestamp = matchOne(CPU_USAGE_TIMESTAMP_PATTERN, lines[0]);

    // top - 10:25:00 up 3 days, 13:14,  1 user,  load average: 90.75, 97.79, 86.84
    const loadAverages = CpuUsageParser.parseLoadAverages(lines.shift());

    // Tasks: 466 total,   4 running, 462 sleeping,   0 stopped,   0 zombie
    const runningProcesses = CpuUsageParser.parseRunningProcesses(lines.shift());

    // Cpu(s): 11.4%us,  0.5%sy,  0.0%ni, 87.9%id,  0.0%wa,  0.0%hi,  0.1%si,  0.0%st
    lines.shift(); // ignoring as it's not a useful data for us

    // Mem:  65846052k total, 57542808k used,  8303244k free,  1200960k buffers
    // Swap:  2097148k total,        0k used,  2097148k free, 23876776k cached
    const memoryUsage = CpuUsageParser.parseMemoryUsage(lines.shift(), lines.shift());

    //
    // PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
    // 13038 wrtjava   20   0 53.0g  26g 1.2g S 48.6 41.6  15:04.56 java
    // 18393 wrtjava   20   0 53.0g  26g 1.2g S  9.7 41.6   4:08.78 java
    // 19084 wrtjava   20   0 53.0g  26g 1.2g S  9.7 41.6   3:07.71 java
    //  ... until <EOT>
    const threadCpuUsages = CpuUsageParser.parseThreadCpuUsages(lines);

    callback(new CpuUsage(timestamp, loadAverages, runningProcesses, memoryUsage, threadCpuUsages));
  }

  private static parseLoadAverages(line?: string): LoadAverages {
    const matches: string[] = matchMultipleGroups(LOAD_AVERAGES_PATTERN, line);

    const oneMinute = parseFloat(matches[0]);
    const fiveMinutes = parseFloat(matches[1]);
    const fifteenMinutes = parseFloat(matches[2]);
    return new LoadAverages(oneMinute, fiveMinutes, fifteenMinutes);
  }

  private static parseRunningProcesses(line?: string): number {
    return parseInt(matchOne(RUNNING_PROCESSES_PATTERN, line), 10);
  }

  private static parseMemoryUsage(line1?: string, line2?: string): MemoryUsage {
    const memoryTotal = parseInt(matchOne(TOTAL_MEMORY_PATTERN, line1), 10);
    const memoryUsed = parseInt(matchOne(USED_MEMORY_PATTERN, line1), 10);
    const memoryFree = parseInt(matchOne(FREE_MEMORY_PATTERN, line1), 10);

    const swapTotal = parseInt(matchOne(TOTAL_MEMORY_PATTERN, line2), 10);
    const swapUsed = parseInt(matchOne(USED_MEMORY_PATTERN, line2), 10);
    const swapFree = parseInt(matchOne(FREE_MEMORY_PATTERN, line2), 10);

    return new MemoryUsage(memoryTotal, memoryUsed, memoryFree, swapTotal, swapUsed, swapFree);
  }

  private static parseThreadCpuUsages(lines: string[]): ThreadCpuUsage[] {
    const threadCpuUsages: ThreadCpuUsage[] = [];

    const offsets: TopColumnOffsets = this.getColumnOffsets(lines[1]);

    lines
      .slice(2)
      .filter((line) => line)
      .map((line) => matchMultipleTimes(COLUMN_MATCHER, line))
      .filter((columns) => columns.length >= 11)
      .forEach((columns) => {
        const id = parseInt(columns[offsets.getProcessIdOffset()], 10);
        const cpuUsage = parseFloat(columns[offsets.getCpuUsageOffset()]);
        const runningFor = columns[offsets.getRunningForOffset()];
        threadCpuUsages.push(new ThreadCpuUsage(id, cpuUsage, runningFor));
      });

    return threadCpuUsages;
  }

  private static getColumnOffsets(header: string): TopColumnOffsets {
    const offsets = new TopColumnOffsets();

    //   PID USER      PR  NI    VIRT    RES    SHR   SWAP S %CPU %MEM     TIME+ COMMAND
    const columns: string[] = matchMultipleTimes(COLUMN_MATCHER, header);
    columns.forEach((columnName, index) => {
      switch (columnName) {
        case 'PID':
          offsets.setProcessIdOffset(index);
          break;
        case '%CPU':
          offsets.setCpuUsageOffset(index);
          break;
        case 'TIME+':
          offsets.setRunningForOffset(index);
          break;
        default:
          break;
      }
    });

    return offsets;
  }
}
