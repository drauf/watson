import CpuUsage from './cpuusage/CpuUsage';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import TopCpuUsageParser, { CPU_USAGE_TIMESTAMP_PATTERN } from './cpuusage/os/TopCpuUsageParser';
import { matchOne } from './RegExpUtils';
import ThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from './ThreadDumpParser';
import CpuUsageJfrParser, { CPU_USAGE_JFR_FIRST_LINE_PATTERN } from './cpuusage/jfr/CpuUsageJfrParser';

const MAX_TIME_DIFFERENCE_ALLOWED = 10000;

export default class Parser {
  private cpuUsages: CpuUsage[] = [];

  private threadDumps: ThreadDump[] = [];

  private filesToParse = 0;

  private readonly onFilesParsed: (threadDumps: ThreadDump[]) => void;

  constructor(onFilesParsed: (threadDumps: ThreadDump[]) => void) {
    this.onFilesParsed = onFilesParsed;
  }

  public parseFiles = (uploaded: File[]): void => {
    this.cpuUsages = [];
    this.threadDumps = [];
    this.filesToParse = 0;

    this.parse(uploaded);
  };

  private parse(files: File[]) {
    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const lines: string[] = (reader.result as string).split('\n');
        const firstLine = lines[0];

        if (!firstLine) {
          this.fileParsed();
          return;
        }

        if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
          this.parseTopCpuUsage(lines);
        } else if (matchOne(CPU_USAGE_JFR_FIRST_LINE_PATTERN, firstLine)) {
          this.parseJfrCpuUsage(file.name, lines);
        } else {
          this.splitThreadDumps(lines);
        }
        this.fileParsed();
      };

      this.filesToParse += 1;
      reader.readAsText(file);
    });
  }

  // a single file can contain multiple thread dumps - split them into "batches"
  private splitThreadDumps(lines: string[]) {
    let currentDump: string[] = [];

    lines.forEach((line) => {
      // check if a new thread dump starts
      if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
        // special case for the first thread dump in the file
        if (currentDump.length === 0) {
          currentDump.push(line);
          return;
        }

        this.parseThreadDump(currentDump);
        currentDump = [line];
      } else if (currentDump.length > 0) {
        // do not add lines if there is no thread dump (e.g. when parsing catalina.out)
        currentDump.push(line);
      }
    });

    if (currentDump.length > 0) {
      this.parseThreadDump(currentDump);
    }
  }

  private parseTopCpuUsage = (lines: string[]) => {
    TopCpuUsageParser.parseCpuUsage(lines.slice(), this.onParsedCpuUsage);
  };

  private parseJfrCpuUsage = (fileName: string, lines: string[]) => {
    CpuUsageJfrParser.parseCpuUsage(fileName, lines.slice(), this.onParsedCpuUsage);
  };

  private onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
  };

  private parseThreadDump = (lines: string[]) => {
    ThreadDumpParser.parseThreadDump(lines.slice(), this.onParsedThreadDump);
  };

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
  };

  private fileParsed() {
    this.filesToParse -= 1;

    // finish parsing if there are no files left
    if (!this.filesToParse) {
      this.groupCpuUsagesWithThreadDumps();
      this.sortThreadDumps();
      this.onFilesParsed(this.threadDumps);
    }
  }

  private groupCpuUsagesWithThreadDumps() {
    this.cpuUsages
      .filter((cpuUsage) => cpuUsage.epoch)
      .forEach((cpuUsage) => {
        const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
        Parser.groupCpuUsageWithThreadDump(threadDump, cpuUsage);
      });
  }

  private sortThreadDumps() {
    this.threadDumps.sort((t1, t2) => {
      if (t1.epoch === t2.epoch) {
        return 0;
      }
      if (!t1.epoch) {
        return -1;
      }
      if (!t2.epoch) {
        return 1;
      }
      return t1.epoch - t2.epoch;
    });
  }

  private findCorrespondingThreadDump(cpuUsage: CpuUsage): ThreadDump {
    const AN_HOUR = 60 * 60 * 1000;
    const cpuUsageEpoch = cpuUsage.epoch;
    let closest: ThreadDump | null = null;
    let smallestDiff: number = MAX_TIME_DIFFERENCE_ALLOWED;

    this.threadDumps
      .filter((threadDump) => threadDump.epoch)
      .forEach((threadDump) => {
        const dumpEpoch = threadDump.epoch;

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
      closest = new ThreadDump(cpuUsageEpoch);
      this.threadDumps.push(closest);
    }

    return closest;
  }

  private static groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
    if (cpuUsage.loadAverages !== undefined) {
      // eslint-disable-next-line no-param-reassign
      threadDump.loadAverages = cpuUsage.loadAverages;
    }
    // eslint-disable-next-line no-param-reassign
    threadDump.runningProcesses = cpuUsage.runningProcesses;
    if (cpuUsage.memoryUsage !== undefined) {
      // eslint-disable-next-line no-param-reassign
      threadDump.memoryUsage = cpuUsage.memoryUsage;
    }

    cpuUsage.getThreadCpuUsages().forEach((cpu) => {
      const thread = Parser.findThreadWithId(threadDump, cpu.id);

      if (thread) {
        thread.cpuUsage = cpu.getCpuUsage();
        thread.runningFor = cpu.runningFor;
      }
    });
  }

  private static findThreadWithId(threadDump: ThreadDump, id: number): Thread | undefined {
    return threadDump.threads.find((thread) => thread.id === id);
  }
}
