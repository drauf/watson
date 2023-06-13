import React from 'react';
import Dropzone from 'react-dropzone';
import { setParsedData } from '../../common/threadDumpsStorageService';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';
import CpuUsageJfr from '../../parser/cpuusage/jfr/CpuUsageJfr';
import { Navigate } from 'react-router-dom';

type State = {
  parsedDataKey: string | undefined;
  hasLoadAverages: boolean;
};

export default class FullPageDropzone extends React.PureComponent<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      parsedDataKey: undefined,
      hasLoadAverages: false
    };
  }

  private onDrop = (files: File[]): void => {
    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  };

  private onParsed = (threadDumps: ThreadDump[], cpuUsageJfrList: CpuUsageJfr[]): void => {
    const key = setParsedData(threadDumps, cpuUsageJfrList);
    this.setState({ parsedDataKey: key, hasLoadAverages: threadDumps.some((dump) => !!dump.loadAverages) })
  };

  public render(): JSX.Element {
    if (this.state.parsedDataKey) {
      if (this.state.hasLoadAverages) {
        return (
          <Navigate to={`/${this.state.parsedDataKey}/summary`} />
        );
      } else {
        return (
          <Navigate to={`/${this.state.parsedDataKey}/similar-stacks`} />
        );
      }
    }

    return (
      <>
        <div className="announcement">
          <span className="ellipsis">
            Watson is a JVM thread dump and CPU usage analyzer.
            It combines the best features of other Java TDAs and optionally hides a lot of noise, like idle threads.
          </span>
        </div>

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
      </>
    );
  }
}
