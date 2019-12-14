import CpuUsage from '../types/CpuUsage';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import CpuUsageParser, { CPU_USAGE_TIMESTAMP_PATTERN } from './CpuUsageParser';
import { matchOne } from './RegExpUtils';
import ThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from './ThreadDumpParser';

const MAX_TIME_DIFFERENCE_ALLOWED: number = 10000;

export default class Parser {
  private cpuUsages: CpuUsage[] = [];
  private threadDumps: ThreadDump[] = [];

  private filesToParse: number = 0;
  private onFilesParsed: (threadDumps: ThreadDump[]) => void;

  constructor(onFilesParsed: (threadDumps: ThreadDump[]) => void) {
    this.onFilesParsed = onFilesParsed;
  }

  public parseFiles = (uploaded: File[]) => {
    this.cpuUsages = [];
    this.threadDumps = [];
    this.filesToParse = 0;

    this.parse(uploaded);
  }

  private parse(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = () => {
        const lines: string[] = (reader.result as string).split('\n');
        const firstLine = lines[0];

        if (!firstLine) {
          this.fileParsed();
          return;
        }

        if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
          this.parseCpuUsage(lines);
        } else {
          this.splitThreadDumps(lines);
        }
        this.fileParsed();
      };

      this.filesToParse = this.filesToParse + 1;
      reader.readAsText(file);
    }
  }

  // a single file can contain multiple thread dumps - split them into "batches"
  private splitThreadDumps(lines: string[]) {
    let currentDump: string[] = [];

    for (const line of lines) {
      // check if a new thread dump starts
      if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
        // special case for the first thread dump in the file
        if (currentDump.length === 0) {
          currentDump.push(line);
          continue;
        }

        this.parseThreadDump(currentDump);
        currentDump = [line];
      } else if (currentDump.length > 0) {
        // do not add lines if there is no thread dump (e.g. when parsing catalina.out)
        currentDump.push(line);
      }
    }

    if (currentDump.length > 0) {
      this.parseThreadDump(currentDump);
    }
  }

  private parseCpuUsage = (lines: string[]) => {
    CpuUsageParser.parseCpuUsage(lines.slice(), this.onParsedCpuUsage);
  }

  private onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
  }

  private parseThreadDump = (lines: string[]) => {
    ThreadDumpParser.parseThreadDump(lines.slice(), this.onParsedThreadDump);
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
  }

  private fileParsed() {
    this.filesToParse = this.filesToParse - 1;

    // finish parsing if there are no files left
    if (!this.filesToParse) {
      this.groupCpuUsagesWithThreadDumps();
      this.sortThreadDumps();
      this.onFilesParsed(this.threadDumps);
    }
  }

  private groupCpuUsagesWithThreadDumps() {
    this.cpuUsages
      .filter(cpuUsage => cpuUsage.getEpoch())
      .forEach((cpuUsage) => {
        const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
        this.groupCpuUsageWithThreadDump(threadDump, cpuUsage);
      });
  }

  private sortThreadDumps() {
    this.threadDumps.sort((t1, t2) => {
      if (t1.getEpoch() === t2.getEpoch()) {
        return 0;
      }
      if (!t1.getEpoch()) {
        return -1;
      }
      if (!t2.getEpoch()) {
        return 1;
      }
      return (t1.getEpoch() as number) - (t2.getEpoch() as number);
    });
  }

  private findCorrespondingThreadDump(cpuUsage: CpuUsage): ThreadDump {
    const AN_HOUR = 60 * 60 * 1000;
    const cpuUsageEpoch = cpuUsage.getEpoch();
    let closest: ThreadDump | null = null;
    let smallestDiff: number = MAX_TIME_DIFFERENCE_ALLOWED;

    this.threadDumps
      .filter(threadDump => threadDump.getEpoch())
      .forEach((threadDump) => {
        const dumpEpoch = threadDump.getEpoch();

        if (!dumpEpoch || !cpuUsageEpoch) {
          return;
        }

        const diff = Math.abs((dumpEpoch % AN_HOUR) - (cpuUsageEpoch % AN_HOUR));

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closest = threadDump;
        }
      });

    if (closest == null) {
      closest = ThreadDump.fromEpoch(cpuUsageEpoch);
      this.threadDumps.push(closest);
    }

    return closest;
  }

  private groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
    threadDump.loadAverages = cpuUsage.loadAverages;
    threadDump.runningProcesses = cpuUsage.runningProcesses;
    threadDump.memoryUsage = cpuUsage.memoryUsage;

    cpuUsage.threadCpuUsages.forEach((cpu) => {
      const thread = this.findThreadWithId(threadDump, cpu.id);

      if (thread) {
        thread.cpuUsage = cpu.cpuUsage;
        thread.runningFor = cpu.runningFor;
      }
    });
  }

  private findThreadWithId(threadDump: ThreadDump, id: number): Thread | null {
    for (const thread of threadDump.threads) {
      if (thread.id === id) {
        return thread;
      }
    }
    return null;
  }
}
