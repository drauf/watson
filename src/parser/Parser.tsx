import ReactGA from 'react-ga';
import CpuUsage from '../types/CpuUsage';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import CpuUsageParser from './CpuUsageParser';
import { matchOne } from './RegExpUtils';
import ThreadDumpParser, { DATE_PATTERN } from './ThreadDumpParser';

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

  public parseFiles = (uploaded: File[]) => {
    this.parsingStarted = Date.now();
    this.cpuUsages = [];
    this.threadDumps = [];
    this.cpuUsagesToParse = 0;
    this.threadDumpsToParse = 0;

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
        if (matchOne(DATE_PATTERN, line)) {
          this.threadDumpsToParse++;
          ThreadDumpParser.parseThreadDump(currentDump.slice(), this.onParsedThreadDump);
          currentDump = [line];
        } else {
          currentDump.push(line);
        }

        line = lines.shift();
      }

      ThreadDumpParser.parseThreadDump(currentDump, this.onParsedThreadDump);
    };
    this.threadDumpsToParse++;
    reader.readAsText(file);
  }

  private parseMultipleFiles(files: File[]) {
    const cpuUsageFiles = [];
    const threadDumpFiles = [];

    for (const file of files) {
      if (file.name.includes('cpu')) {
        cpuUsageFiles.push(file);
        this.cpuUsagesToParse++;
      } else if (file.name !== 'pmap_output.txt') {
        threadDumpFiles.push(file);
        this.threadDumpsToParse++;
      }
    }
    this.parseCpuUsages(cpuUsageFiles);
    this.parseThreadDumps(threadDumpFiles);
  }

  private parseCpuUsages(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = ((name: string) => () => {
        const lines: string[] = (reader.result as string).split('\n');
        CpuUsageParser.parseCpuUsage(name, lines, this.onParsedCpuUsage);
      })(file.name);

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

      reader.onload = () => {
        const lines: string[] = (reader.result as string).split('\n');
        ThreadDumpParser.parseThreadDump(lines, this.onParsedThreadDump);
      };

      reader.readAsText(file);
    }
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
    this.threadDumpsToParse = this.threadDumpsToParse - 1;
    this.checkCompletion();
  }

  private checkCompletion() {
    if (!this.cpuUsagesToParse && !this.threadDumpsToParse) {
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
        const usageEpoch = cpuUsageEpoch;

        if (!dumpEpoch || !usageEpoch) {
          return;
        }

        const diff = Math.abs((dumpEpoch % AN_HOUR) - (usageEpoch % AN_HOUR));

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
