import ReactGA from 'react-ga';
import CpuUsage from '../types/CpuUsage';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import CpuUsageParser, { ParseCpuUsageCallback } from './CpuUsageParser';
import ThreadDumpParser, { ParseThreadDumpCallback } from './ThreadDumpParser';

const MAX_TIME_DIFFERENCE_ALLOWED: number = 10000;

export default class Parser {
  private parsingStarted: number = Date.now();
  private cpuUsages: CpuUsage[] = [];
  private threadDumps: ThreadDump[] = [];
  private cpuUsagesToParse: number = 0;
  private threadDumpsToParse: number = 0;
  private onFilesParsed: (threadDumps: ThreadDump[]) => void;

  constructor(onFilesParsed: (threadDumps: ThreadDump[]) => void) {
    this.onFilesParsed = onFilesParsed;
  }

  public parseFiles = (accepted: File[]) => {
    this.parsingStarted = Date.now();
    const cpuUsageFiles: File[] = [];
    const threadDumpFiles: File[] = [];
    this.groupFiles(accepted, cpuUsageFiles, threadDumpFiles);

    this.cpuUsages = [];
    this.threadDumps = [];
    this.cpuUsagesToParse = cpuUsageFiles.length;
    this.threadDumpsToParse = threadDumpFiles.length;

    ReactGA.event({
      action: 'Loaded CPU usages',
      category: 'Parsing',
      value: this.cpuUsagesToParse,
    });
    ReactGA.event({
      action: 'Loaded thread dumps',
      category: 'Parsing',
      value: this.threadDumpsToParse,
    });

    this.parseCpuUsages(cpuUsageFiles);
    this.parseThreadDumps(threadDumpFiles);
  }

  private groupFiles(files: File[], cpuUsageFiles: File[], threadDumpFiles: File[]) {
    for (const file of files) {
      if (file.name.includes('cpu')) {
        cpuUsageFiles.push(file);
      } else {
        threadDumpFiles.push(file);
      }
    }
  }

  private parseCpuUsages(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = ((cpuUsage: File, callback: ParseCpuUsageCallback) => {
        return function (this: FileReader) {
          CpuUsageParser.parseCpuUsage(cpuUsage, this, callback);
        };
      })(file, this.onParsedCpuUsage);

      reader.readAsText(file);
    }
  }

  private onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
    this.cpuUsagesToParse = this.cpuUsagesToParse - 1;
    this.checkCompletion();
  }

  private parseThreadDumps(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = ((threadDump: File, callback: ParseThreadDumpCallback) => {
        return function (this: FileReader) {
          ThreadDumpParser.parseThreadDump(threadDump, this, callback);
        };
      })(file, this.onParsedThreadDump);

      reader.readAsText(file);
    }
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    this.threadDumps.push(threadDump);
    this.threadDumpsToParse = this.threadDumpsToParse - 1;
    this.checkCompletion();
  }

  private checkCompletion() {
    if (!this.cpuUsagesToParse && !this.threadDumpsToParse) {
      ReactGA.timing({
        category: 'Parsing',
        value: Date.now() - this.parsingStarted,
        variable: 'parsed-all',
      });

      this.groupCpuUsagesWithThreadDumps();
      this.sortThreadDumps();
      this.onFilesParsed(this.threadDumps);
    }
  }

  private groupCpuUsagesWithThreadDumps() {
    this.cpuUsages
      .filter(cpuUsage => cpuUsage.date)
      .forEach((cpuUsage) => {
        const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
        this.groupCpuUsageWithThreadDump(threadDump, cpuUsage);
      });
  }

  private sortThreadDumps() {
    this.threadDumps.sort((t1, t2) => {
      if (t1.date === t2.date) {
        return 0;
      }
      if (!t1.date) {
        return -1;
      }
      if (!t2.date) {
        return 1;
      }
      return t1.date.valueOf() - t2.date.valueOf();
    });
  }

  private findCorrespondingThreadDump(cpuUsage: CpuUsage): ThreadDump {
    let closest: ThreadDump | null = null;
    let smallestDiff: number = MAX_TIME_DIFFERENCE_ALLOWED;
    const cpuUsageDate = cpuUsage.date as Date;

    this.threadDumps
      .filter(threadDump => threadDump.date)
      .forEach((threadDump) => {
        const diff = Math.abs((threadDump.date as Date).valueOf() - cpuUsageDate.valueOf());

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

  private groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
    threadDump.loadAverages = cpuUsage.loadAverages;
    threadDump.currentCpuUsage = cpuUsage.currentCpuUsage;
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
