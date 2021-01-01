import React from 'react';
import Dropzone from 'react-dropzone';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { setThreadDumps } from '../../common/threadDumpsStorageService';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';

class FullPageDropzone extends React.PureComponent<RouteComponentProps> {
  public render = () => (
    /* eslint-disable react/jsx-props-no-spreading */
    <Dropzone multiple onDrop={this.onDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div id="dropzone" {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isDragActive
              ? <h4>Drop files here...</h4>
              : <h4>Drop the catalog here, or click to select files to load.</h4>
          }
          <DropzoneGuide />
        </div>
      )}
    </Dropzone>
    /* eslint-enable react/jsx-props-no-spreading */
  )

  private onDrop = (files: File[]): void => {
    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  }

  private onParsed = (threadDumps: ThreadDump[]): void => {
    const { history } = this.props;
    const key = setThreadDumps(threadDumps);

    if (threadDumps.some((dump) => !!dump.loadAverages)) {
      history.push(`/${key}/summary/`);
    } else {
      history.push(`/${key}/similar-stacks/`);
    }
  }
}

export default withRouter(FullPageDropzone);
