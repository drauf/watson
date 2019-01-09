import * as React from 'react';
import Dropzone from 'react-dropzone';
import FullPageDropzone from './FullPageDropzone';
import Layout from './Layout';
import { Parser } from './parser/Parser';
import { ThreadDump } from './types/ThreadDump';

interface AppState {
  threadDumps: ThreadDump[];
  parser: Parser;
}

class App extends React.Component<any, AppState> {
  public state: AppState = {
    parser: new Parser(this.handleFilesParsed.bind(this)),
    threadDumps: []
  };

  public handleFilesParsed(threadDumps: ThreadDump[]) {
    this.setState({ threadDumps });
  }

  public render() {
    return (
      <Dropzone
        onDrop={this.state.parser.parseFiles}
        accept=".txt"
        multiple={true}
      >
        {({ getRootProps, getInputProps, isDragActive }) => {
          if (this.state.threadDumps.length === 0) {
            return (
              <FullPageDropzone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
            )
          }
          return (
            <Layout />
          )
        }}
      </Dropzone>
    )
  }
}

export default App;
