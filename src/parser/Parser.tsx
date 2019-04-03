import ReactGA from 'react-ga';
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
  private parsingStarted: number = Date.now();
  private onFilesParsed: (threadDumps: ThreadDump[]) => void;

  constructor(onFilesParsed: (threadDumps: ThreadDump[]) => void) {
    this.onFilesParsed = onFilesParsed;
  }

  public parseFiles = (uploaded: File[]) => {
    this.parsingStarted = Date.now();
    this.cpuUsages = [];
    this.threadDumps = [];
    this.filesToParse = 0;

    this.parse(uploaded);
  }

  private parse(files: File[]) {
    // if only one file was uploaded, assume that it's a set of dumps
    if (files.length === 1 && !files[0].name.includes('cpu')) {
      this.parseSingleFile(files[0]);
    } else {
      this.parseMultipleFiles(files);
    }
  }

  private parseSingleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const lines: string[] = (reader.result as string).split('\n');

      let line = lines.shift();
      let currentDump: string[] = [];
      while (line !== undefined) {
        // check if it's the beginning of another thread dump
        if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
          this.filesToParse++;
          ThreadDumpParser.parseThreadDump(currentDump.slice(), this.onParsedThreadDump);
          currentDump = [line];
        } else {
          currentDump.push(line);
        }

        line = lines.shift();
      }

      ThreadDumpParser.parseThreadDump(currentDump, this.onParsedThreadDump);
    };
    this.filesToParse++;
    reader.readAsText(file);
  }

  private parseMultipleFiles(files: File[]) {
    this.filesToParse = this.filesToParse + files.length;

    for (const file of files) {
      const reader = new FileReader();

      reader.onload = () => {
        const lines: string[] = (reader.result as string).split('\n');
        const firstLine = lines[0];

        if (!firstLine) {
          return;
        }

        if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
          CpuUsageParser.parseCpuUsage(lines, this.onParsedCpuUsage);
        } else if (matchOne(THREAD_DUMP_DATE_PATTERN, firstLine)) {
          ThreadDumpParser.parseThreadDump(lines, this.onParsedThreadDump);
        } else {
          this.filesToParse = this.filesToParse - 1;
        }
      };

      reader.readAsText(file);
    }
  }

  private onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
    this.filesToParse = this.filesToParse - 1;
    this.checkCompletion();
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
    this.filesToParse = this.filesToParse - 1;
    this.checkCompletion();
  }

  private checkCompletion() {
    if (!this.filesToParse) {
      this.fireAnalytics();
      this.groupCpuUsagesWithThreadDumps();
      this.sortThreadDumps();
      this.onFilesParsed(this.threadDumps);
    }
  }

  private fireAnalytics() {
    ReactGA.timing({
      category: 'Parsing',
      value: Date.now() - this.parsingStarted,
      variable: 'parsed-all',
    });
    ReactGA.event({
      action: 'Loaded CPU usages',
      category: 'Parsing',
      value: this.cpuUsages.length,
    });
    ReactGA.event({
      action: 'Loaded thread dumps',
      category: 'Parsing',
      value: this.threadDumps.length,
    });
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
      closest = new ThreadDump(null);
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
