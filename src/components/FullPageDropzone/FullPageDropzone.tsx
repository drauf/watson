import React from 'react';
import Dropzone from 'react-dropzone';
import { Navigate } from 'react-router-dom';
import { setParsedData } from '../../common/threadDumpsStorageService';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';

interface Props {
  // This component doesn't receive any props
}

type State = {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
};

export default class FullPageDropzone extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      parsedDataKey: undefined,
      hasCpuUsageInfo: false,
    };
  }

  private onDrop = (files: File[]): void => {
    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  };

  private onParsed = (threadDumps: ThreadDump[]): void => {
    const key = setParsedData(threadDumps);
    this.setState({ parsedDataKey: key, hasCpuUsageInfo: threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00')) });
  };

  public override render(): JSX.Element {
    const { parsedDataKey, hasCpuUsageInfo } = this.state;

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

    return (
      <Dropzone multiple onDrop={this.onDrop}>
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
