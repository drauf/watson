import CpuUsage from '../types/CpuUsage';
import LoadAverages from '../types/LoadAverage';
import MemoryUsage from '../types/MemoryUsage';
import ThreadCpuUsage from '../types/ThreadCpuUsage';
import { matchMultipleGroups, matchMultipleTimes, matchOne } from './RegExpUtils';

export const CPU_USAGE_TIMESTAMP_PATTERN: RegExp = /^top - ([0-9]{2}:[0-9]{2}:[0-9]{2})/;
const LOAD_AVERAGES_PATTERN: RegExp = / load average: ([0-9\.]+), ([0-9\.]+), ([0-9\.]+)/;
const RUNNING_PROCESSES_PATTERN: RegExp = /([0-9\.]+) running/;
const TOTAL_MEMORY_PATTERN: RegExp = /([0-9\.]+)k?[ +]total/;
const USED_MEMORY_PATTERN: RegExp = /([0-9\.]+)k? used/;
const FREE_MEMORY_PATTERN: RegExp = /([0-9\.]+)k? free/;
const COLUMN_MATCHER: RegExp = /([^\s]+) +/g;

export type ParseCpuUsageCallback = (cpuUsage: CpuUsage) => void;

export default class CpuUsageParser {

  public static parseCpuUsage(lines: string[], callback: ParseCpuUsageCallback) {
    const cpuUsage: CpuUsage = new CpuUsage(matchOne(CPU_USAGE_TIMESTAMP_PATTERN, lines[0]));

    // top - 10:25:00 up 3 days, 13:14,  1 user,  load average: 90.75, 97.79, 86.84
    cpuUsage.loadAverages = CpuUsageParser.parseLoadAverages(lines.shift());

    // Tasks: 466 total,   4 running, 462 sleeping,   0 stopped,   0 zombie
    cpuUsage.runningProcesses = CpuUsageParser.parseRunningProcesses(lines.shift());

    // Cpu(s): 11.4%us,  0.5%sy,  0.0%ni, 87.9%id,  0.0%wa,  0.0%hi,  0.1%si,  0.0%st
    lines.shift(); // ignoring as it's not a useful data for us

    // Mem:  65846052k total, 57542808k used,  8303244k free,  1200960k buffers
    // Swap:  2097148k total,        0k used,  2097148k free, 23876776k cached
    cpuUsage.memoryUsage = CpuUsageParser.parseMemoryUsage(lines.shift(), lines.shift());

    //
    // PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
    // 13038 wrtjava   20   0 53.0g  26g 1.2g S 48.6 41.6  15:04.56 java
    // 18393 wrtjava   20   0 53.0g  26g 1.2g S  9.7 41.6   4:08.78 java
    // 19084 wrtjava   20   0 53.0g  26g 1.2g S  9.7 41.6   3:07.71 java
    //  ... until <EOT>
    cpuUsage.threadCpuUsages = CpuUsageParser.parseThreadCpuUsages(lines);

    callback(cpuUsage);
  }

  private static parseLoadAverages(line?: string): LoadAverages | null {
    const matches: string[] = matchMultipleGroups(LOAD_AVERAGES_PATTERN, line);

    if (matches.length !== 3) {
      console.error(`Unable to parse load averages from line: ${line}`);
      return null;
    }

    const loadAverages = new LoadAverages();
    loadAverages.oneMinute = parseFloat(matches[0]);
    loadAverages.fiveMinutes = parseFloat(matches[1]);
    loadAverages.fifteenMinutes = parseFloat(matches[2]);
    return loadAverages;
  }

  private static parseRunningProcesses(line?: string): number {
    return parseInt(matchOne(RUNNING_PROCESSES_PATTERN, line), 10);
  }

  private static parseMemoryUsage(line1?: string, line2?: string): MemoryUsage {
    const memoryUsage: MemoryUsage = new MemoryUsage();

    memoryUsage.memoryTotal = parseInt(matchOne(TOTAL_MEMORY_PATTERN, line1), 10);
    memoryUsage.memoryUsed = parseInt(matchOne(USED_MEMORY_PATTERN, line1), 10);
    memoryUsage.memoryFree = parseInt(matchOne(FREE_MEMORY_PATTERN, line1), 10);

    memoryUsage.swapTotal = parseInt(matchOne(TOTAL_MEMORY_PATTERN, line2), 10);
    memoryUsage.swapUsed = parseInt(matchOne(USED_MEMORY_PATTERN, line2), 10);
    memoryUsage.swapFree = parseInt(matchOne(FREE_MEMORY_PATTERN, line2), 10);

    return memoryUsage;
  }

  private static parseThreadCpuUsages(lines: string[]): ThreadCpuUsage[] {
    const threadCpuUsages: ThreadCpuUsage[] = [];

    for (let i = 2; i < lines.length; i++) {
      const line: string = lines[i];
      if (!line) continue;

      const columns: string[] = matchMultipleTimes(COLUMN_MATCHER, line);
      if (columns.length < 11) {
        console.error(`Unable to parse thread cpu usage info from line: ${line}`);
        continue;
      }

      const threadCpuUsage: ThreadCpuUsage = new ThreadCpuUsage();
      threadCpuUsage.id = parseInt(columns[0], 10);
      threadCpuUsage.cpuUsage = parseFloat(columns[8]);
      threadCpuUsage.runningFor = columns[10];
      threadCpuUsages.push(threadCpuUsage);
    }

    return threadCpuUsages;
  }
}
