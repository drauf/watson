import Heading from '@atlaskit/heading';
import React, { type JSX } from 'react';
import Dropzone from 'react-dropzone';
import { Navigate } from 'react-router-dom';
import { setParsedData } from '../../common/threadDumpsStorageService';
import type { ParseProgress } from '../../parser/ParseProgress';
import WorkerParser from '../../parser/WorkerParser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import ProgressIndicator, { type StorageProgress, type UploadProgress } from '../ProgressIndicator/ProgressIndicator';
import FullPageError from '../Errors/FullPageError';
import './FullPageDropzone.css';

interface State {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
  isProcessing: boolean;
  progress?: UploadProgress | undefined;
  error?: string | undefined;
}

export default class FullPageDropzone extends React.PureComponent<Record<string, never>, State> {
  private static markPerformance(phase: string): void {
    if (typeof performance.mark === 'function') {
      performance.mark(`watson:${phase}`);
    }
  }

  private static waitForPaint(): Promise<void> {
    return new Promise((resolve) => {
      const afterFrame = () => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => resolve());
        } else {
          setTimeout(resolve, 0);
        }
      };

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(afterFrame);
      } else {
        setTimeout(afterFrame, 0);
      }
    });
  }

  private isStoringPrepared = false;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      parsedDataKey: undefined,
      hasCpuUsageInfo: false,
      isProcessing: false,
      progress: undefined,
      error: undefined,
    };
  }

  private onDrop = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;

    this.isStoringPrepared = false;
    this.setState({
      isProcessing: true,
      error: undefined,
      progress: undefined,
    });

    try {
      const parser = new WorkerParser(this.onParsed, this.onProgress, this.prepareStoring);
      await parser.parseFiles(files);
    } catch (error) {
      console.error('Error parsing files:', error);
      this.setState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An error occurred while parsing files',
        progress: undefined,
      });
    }
  };

  private setProgress = (progress: UploadProgress): Promise<void> => new Promise((resolve) => {
    this.setState({ progress }, resolve);
  });

  private onProgress = (progress: ParseProgress): Promise<void> => this.setProgress(progress);

  private prepareStoring = async (): Promise<void> => {
    if (this.isStoringPrepared) return;

    const { progress: currentProgress } = this.state;
    const storingProgress: StorageProgress = {
      phase: 'storing',
      fileName: '',
      filesProcessed: currentProgress?.filesProcessed ?? 0,
      totalFiles: currentProgress?.totalFiles ?? 0,
      linesProcessed: 0,
      totalLines: 0,
      percentage: currentProgress?.percentage ?? 100,
    };

    await this.setProgress(storingProgress);
    FullPageDropzone.markPerformance('storing:state-committed');
    await FullPageDropzone.waitForPaint();
    FullPageDropzone.markPerformance('storing:painted');
    this.isStoringPrepared = true;
  };

  private onParsed = async (threadDumps: ThreadDump[]): Promise<void> => {
    await this.prepareStoring();

    try {
      FullPageDropzone.markPerformance('storage:start');
      const key = await setParsedData(threadDumps);
      FullPageDropzone.markPerformance('storage:complete');
      this.setState({
        parsedDataKey: key,
        hasCpuUsageInfo: threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00')),
        isProcessing: false,
        progress: undefined,
      });
    } catch (error) {
      this.setState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An error occurred while storing parsed data',
        progress: undefined,
      });
    }
  };

  public override render(): JSX.Element {
    const {
      parsedDataKey, hasCpuUsageInfo, isProcessing, progress, error,
    } = this.state;

    if (parsedDataKey) {
      if (hasCpuUsageInfo) {
        return (
          <Navigate to={`/${parsedDataKey}/summary`} />
        );
      }
      return (
        <Navigate to={`/${parsedDataKey}/similar-stacks`} />
      );
    }

    // Show progress indicator while processing
    if (isProcessing && progress) {
      return <ProgressIndicator progress={progress} />;
    }

    // Show error if parsing failed
    if (error) {
      return (
        <FullPageError
          title="Error processing files"
          message={error}
        />
      );
    }

    return (
      <Dropzone
        multiple
        onDrop={(files) => {
          this.onDrop(files).catch(console.error);
        }}
        disabled={isProcessing}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (

          <div id="dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            {
              isDragActive
                ? <Heading as="h4" size="large">Drop files here...</Heading>
                : <Heading as="h4" size="large">Drop files or folders here, or click to browse</Heading>
            }
            <DropzoneGuide />
          </div>

        )}
      </Dropzone>
    );
  }
}
