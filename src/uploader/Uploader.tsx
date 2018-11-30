import * as React from 'react';
import { ThreadDump, CpuUsage } from '../types';
import { parseThreadDump, ParseThreadDumpCallback } from './parseThreadDump';
import { parseCpuUsage, ParseCpuUsageCallback } from './parseCpuUsage';

export interface UploaderProps {
  onFilesParsed: (threadDump: ThreadDump) => void;
}

class UploaderState {
  cpuUsages: CpuUsage[] = [];
  threadDumps: ThreadDump[] = [];
  cpuUsagesToParse: number = 0;
  threadDumpsToParse: number = 0;
}

export class Uploader extends React.Component<UploaderProps, UploaderState> {
  handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cpuUsageFiles: File[] = [];
    const threadDumpFiles: File[] = [];
    this.groupFiles(event.target.files, cpuUsageFiles, threadDumpFiles);

    this.setState({
      cpuUsages: [],
      threadDumps: [],
      cpuUsagesToParse: cpuUsageFiles.length,
      threadDumpsToParse: threadDumpFiles.length
    });

    this.parseCpuUsages(cpuUsageFiles);
    this.parseThreadDumps(threadDumpFiles);
  }

  groupFiles(files: FileList | null, cpuUsageFiles: File[], threadDumpFiles: File[]) {
    if (files == null) {
      return;
    }

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
    this.state.cpuUsages.push(cpuUsage);
    this.setState((state) => {
      return { cpuUsagesToParse: state.cpuUsagesToParse - 1 };
    });
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
    this.state.threadDumps.push(threadDump);
    this.setState((state) => {
      return { threadDumpsToParse: state.threadDumpsToParse - 1 };
    });
    this.checkCompletion();
  }

  checkCompletion() {
    console.log(this.state);

    if (this.state.cpuUsagesToParse == 0 && this.state.threadDumpsToParse == 0) {
      // merge them together
      // send them higher
    }
  }

  render() {
    return (
      <div id="file-uploader">
        <input type="file" onChange={this.handleFilesSelect} required multiple />
      </div>
    )
  }
}
