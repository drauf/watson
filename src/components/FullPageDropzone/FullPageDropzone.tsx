import React from 'react';
import Dropzone from 'react-dropzone';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { setThreadDumps } from '../../common/threadDumpsStorageService';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';

class FullPageDropzone extends React.PureComponent<RouteComponentProps> {
  private onDrop = (files: File[]): void => {
    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  };

  private onParsed = (threadDumps: ThreadDump[]): void => {
    const { history } = this.props;
    const key = setThreadDumps(threadDumps);

    if (threadDumps.some((dump) => !!dump.loadAverages)) {
      history.push(`/${key}/summary/`);
    } else {
      history.push(`/${key}/similar-stacks/`);
    }
  };

  public render(): JSX.Element {
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

export default withRouter(FullPageDropzone);
