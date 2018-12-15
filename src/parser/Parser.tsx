import { ThreadDump, CpuUsage, Thread } from '../types';
import { parseThreadDump, ParseThreadDumpCallback } from './parseThreadDump';
import { parseCpuUsage, ParseCpuUsageCallback } from './parseCpuUsage';

const MAX_TIME_DIFFERENCE_ALLOWED: number = 10000;

export class Parser {
  cpuUsages: CpuUsage[] = [];
  threadDumps: ThreadDump[] = [];
  cpuUsagesToParse: number = 0;
  threadDumpsToParse: number = 0;
  onFilesParsed: (threadDumps: ThreadDump[]) => void;

  constructor(onFilesParsed: (threadDumps: ThreadDump[]) => void) {
    this.onFilesParsed = onFilesParsed;
  }

  parseFiles = (accepted: File[]) => {
    const cpuUsageFiles: File[] = [];
    const threadDumpFiles: File[] = [];
    this.groupFiles(accepted, cpuUsageFiles, threadDumpFiles);

    this.cpuUsages = [];
    this.threadDumps = [];
    this.cpuUsagesToParse = cpuUsageFiles.length;
    this.threadDumpsToParse = threadDumpFiles.length;

    this.parseCpuUsages(cpuUsageFiles);
    this.parseThreadDumps(threadDumpFiles);
  }

  groupFiles(files: File[], cpuUsageFiles: File[], threadDumpFiles: File[]) {
    for (const file of files) {
      if (file.name.includes("cpu")) {
        cpuUsageFiles.push(file);
      } else {
        threadDumpFiles.push(file);
      }
    }
  }

  parseCpuUsages(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = ((file: File, callback: ParseCpuUsageCallback) => {
        return function (this: FileReader) {
          parseCpuUsage(file, this, callback);
        }
      })(file, this.onParsedCpuUsage);

      reader.readAsText(file);
    }
  }

  onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
    this.cpuUsagesToParse = this.cpuUsagesToParse - 1;
    this.checkCompletion();
  }

  parseThreadDumps(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = ((file: File, callback: ParseThreadDumpCallback) => {
        return function (this: FileReader) {
          parseThreadDump(file, this, callback);
        }
      })(file, this.onParsedThreadDump);

      reader.readAsText(file);
    }
  }

  onParsedThreadDump = (threadDump: ThreadDump) => {
    this.threadDumps.push(threadDump);
    this.threadDumpsToParse = this.threadDumpsToParse - 1;
    this.checkCompletion();
  }

  checkCompletion() {
    if (!this.cpuUsagesToParse && !this.threadDumpsToParse) {
      this.groupCpuUsagesWithThreadDumps();
      this.onFilesParsed(this.threadDumps);
    }
  }

  groupCpuUsagesWithThreadDumps() {
    this.cpuUsages
      .filter(cpuUsage => cpuUsage.date)
      .forEach(cpuUsage => {
        const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
        this.groupCpuUsageWithThreadDump(threadDump, cpuUsage);
      });
  }

  findCorrespondingThreadDump(cpuUsage: CpuUsage): ThreadDump {
    let closest: ThreadDump | null = null;
    let smallestDiff: number = MAX_TIME_DIFFERENCE_ALLOWED;
    let cpuUsageDate = cpuUsage.date as Date;

    this.threadDumps
      .filter(threadDump => threadDump.date)
      .forEach(threadDump => {
        let diff = Math.abs((threadDump.date as Date).valueOf() - cpuUsageDate.valueOf());

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closest = threadDump;
        }
      });

    if (closest == null) {
      closest = new ThreadDump();
      this.threadDumps.push(closest);
    }

    return closest;
  }

  groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
    threadDump.loadAverages = cpuUsage.loadAverages;
    threadDump.memoryUsage = cpuUsage.memoryUsage;

    cpuUsage.threadCpuUsages.forEach(cpu => {
      const thread = this.findThreadWithId(threadDump, cpu.id);

      if (thread) {
        thread.cpuUsage = cpu.cpuUsage;
        thread.runningFor = cpu.runningFor;
      }
    });
  }

  findThreadWithId(threadDump: ThreadDump, id: number): Thread | null {
    threadDump.threads.forEach(thread => {
      if (thread.id === id) {
        return thread;
      }
    })
    return null;
  }
}
