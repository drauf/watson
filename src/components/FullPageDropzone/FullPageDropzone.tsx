import React from 'react';
import Dropzone from 'react-dropzone';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { setThreadDumps } from '../../App';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';

class FullPageDropzone extends React.PureComponent<RouteComponentProps> {
  public render = () => (
    <Dropzone accept=".txt" multiple={true} onDrop={this.onDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div id="dropzone" {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isDragActive ?
              <h4>Drop files here...</h4> :
              <h4>Try dropping some files here, or click to select files to upload.</h4>
          }
          <DropzoneGuide />
        </div>
      )}
    </Dropzone>
  )

  private onDrop = (files: File[]): void => {
    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  }

  private onParsed = (threadDumps: ThreadDump[]): void => {
    setThreadDumps(threadDumps);
    this.props.history.push('/summary/');
  }
}

export default withRouter(FullPageDropzone);
