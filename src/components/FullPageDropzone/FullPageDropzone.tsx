import Heading from '@atlaskit/heading';
import React, { type JSX } from 'react';
import Dropzone from 'react-dropzone';
import { Navigate } from 'react-router-dom';
import { setParsedData } from '../../common/threadDumpsStorageService';
import AsyncParser, { ParseProgress } from '../../parser/AsyncParser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import FullPageError from '../Errors/FullPageError';
import './FullPageDropzone.css';

interface State {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
  isProcessing: boolean;
  progress?: ParseProgress | undefined;
  error?: string | undefined;
}

export default class FullPageDropzone extends React.PureComponent<Record<string, never>, State> {
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

    this.setState({
      isProcessing: true,
      error: undefined,
      progress: undefined,
    });

    try {
      const parser = new AsyncParser(this.onParsed, this.onProgress);
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

  private onProgress = (progress: ParseProgress): void => {
    this.setState({ progress });
  };

  private onParsed = (threadDumps: ThreadDump[]): void => {
    const key = setParsedData(threadDumps);
    this.setState({
      parsedDataKey: key,
      hasCpuUsageInfo: threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00')),
      isProcessing: false,
      progress: undefined,
    });
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
