import * as React from 'react';
import Dropzone from 'react-dropzone';
import { Parser } from './parser/Parser';
import { ThreadDump } from './types';

interface AppState {
  threadDumps: ThreadDump[],
  parser: Parser
}

class App extends React.Component<any, AppState> {
  state: AppState = {
    threadDumps: [],
    parser: new Parser(this.handleFilesParsed.bind(this))
  };

  handleFilesParsed(threadDumps: ThreadDump[]) {
    this.setState({ threadDumps: threadDumps });
    console.log(threadDumps);
  }

  render() {
    return (
      <Dropzone
        onDrop={this.state.parser.parseFiles}
        accept=".txt"
        multiple={true}
      >
        {({ getRootProps, getInputProps, isDragActive }) => {
          if (this.state.threadDumps.length === 0)
            return (
              <div className="dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>Drop files here...</p> :
                    <p>Try dropping some files here, or click to select files to upload.</p>
                }
              </div>
            )
          else
            return (
              <div>Uploaded!</div>
            )
        }}
      </Dropzone>
    )
  }
}

export default App;
