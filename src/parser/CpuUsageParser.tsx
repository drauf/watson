import CpuUsage from '../types/CpuUsage';
import CurrentCpuUsage from '../types/CurrentCpuUsage';
import LoadAverages from '../types/LoadAverage';
import MemoryUsage from '../types/MemoryUsage';
import ThreadCpuUsage from '../types/ThreadCpuUsage';
import { getDateFromFilename, matchMultipleGroups, matchMultipleTimes, matchOne } from './RegExpUtils';

const FILENAME_DATE_PATTERN: RegExp = /\.(\d*)\.txt$/;
const LOAD_AVERAGES_PATTERN: RegExp = / load average: ([0-9\.]+), ([0-9\.]+), ([0-9\.]+)/;
const USER_CPU_PATTERN: RegExp = /([0-9\.]+)%us/;
const SYSTEM_CPU_PATTERN: RegExp = /([0-9\.]+)%sy/;
const TOTAL_MEMORY_PATTERN: RegExp = /([0-9\.]+)k?[ +]total/;
const USED_MEMORY_PATTERN: RegExp = /([0-9\.]+)k? used/;
const FREE_MEMORY_PATTERN: RegExp = /([0-9\.]+)k? free/;
const COLUMN_MATCHER: RegExp = /([0-9A-Za-z\.:]+) +/g;

export type ParseCpuUsageCallback = (cpuUsage: CpuUsage) => void;

export default class CpuUsageParser {

  public static parseCpuUsage(file: File, reader: FileReader, callback: ParseCpuUsageCallback) {
    const cpuUsage: CpuUsage = new CpuUsage();
    cpuUsage.date = getDateFromFilename(file.name, FILENAME_DATE_PATTERN);

    const lines: string[] = (reader.result as string).split('\n');

    // top - 10:25:00 up 3 days, 13:14,  1 user,  load average: 90.75, 97.79, 86.84
    cpuUsage.loadAverages = CpuUsageParser.parseLoadAverages(lines.shift());

    // Tasks: 466 total,   4 running, 462 sleeping,   0 stopped,   0 zombie
    lines.shift();

    // Cpu(s): 11.4%us,  0.5%sy,  0.0%ni, 87.9%id,  0.0%wa,  0.0%hi,  0.1%si,  0.0%st
    cpuUsage.currentCpuUsage = CpuUsageParser.parseCurrentCpuUsage(lines.shift());

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

  private static parseLoadAverages(line: string | undefined): LoadAverages | null {
    const matches: string[] = matchMultipleGroups(line, LOAD_AVERAGES_PATTERN);

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

  private static parseCurrentCpuUsage(line: string | undefined): CurrentCpuUsage {
    const currentCpuUsage: CurrentCpuUsage = new CurrentCpuUsage();

    currentCpuUsage.userTime = parseInt(matchOne(line, USER_CPU_PATTERN), 10);
    currentCpuUsage.systemTime = parseInt(matchOne(line, SYSTEM_CPU_PATTERN), 10);

    return currentCpuUsage;
  }

  private static parseMemoryUsage(line1: string | undefined, line2: string | undefined): MemoryUsage {
    const memoryUsage: MemoryUsage = new MemoryUsage();

    memoryUsage.memoryTotal = parseInt(matchOne(line1, TOTAL_MEMORY_PATTERN), 10);
    memoryUsage.memoryUsed = parseInt(matchOne(line1, USED_MEMORY_PATTERN), 10);
    memoryUsage.memoryFree = parseInt(matchOne(line1, FREE_MEMORY_PATTERN), 10);

    memoryUsage.swapTotal = parseInt(matchOne(line2, TOTAL_MEMORY_PATTERN), 10);
    memoryUsage.swapUsed = parseInt(matchOne(line2, USED_MEMORY_PATTERN), 10);
    memoryUsage.swapFree = parseInt(matchOne(line2, FREE_MEMORY_PATTERN), 10);

    return memoryUsage;
  }

  private static parseThreadCpuUsages(lines: string[]): ThreadCpuUsage[] {
    const threadCpuUsages: ThreadCpuUsage[] = [];

    for (let i = 2; i < lines.length; i++) {
      const line: string = lines[i];
      if (!line) continue;

      const columns: string[] = matchMultipleTimes(line, COLUMN_MATCHER);
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
