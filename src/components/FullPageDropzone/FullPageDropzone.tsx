import React from 'react';
import Dropzone from 'react-dropzone';
import { Navigate } from 'react-router-dom';
import { setParsedData } from '../../common/threadDumpsStorageService';
import AsyncParser, { ParseProgress } from '../../parser/AsyncParser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import './FullPageDropzone.css';

interface Props {
  // This component doesn't receive any props
}

type State = {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
  isProcessing: boolean;
  progress?: ParseProgress;
  error?: string;
};

export default class FullPageDropzone extends React.PureComponent<Props, State> {
  constructor(props: Props) {
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
        <div className="error-container">
          <h3>Error Processing Files</h3>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: undefined })}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <Dropzone
        multiple
        onDrop={(files) => { this.onDrop(files).catch(console.error); }}
        disabled={isProcessing}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          /* eslint-disable react/jsx-props-no-spreading */
          <div id="dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            {
              isDragActive
                ? <h4>Drop files here...</h4>
                : <h4>Drop a catalog here, or click to select files to load.</h4>
            }
            <DropzoneGuide />
          </div>
          /* eslint-enable react/jsx-props-no-spreading */
        )}
      </Dropzone>
    );
  }
}
