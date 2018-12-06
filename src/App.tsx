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
        className="dropzone"
        onDrop={this.state.parser.parseFiles}
        accept=".txt"
        multiple={true}
      >
        {this.state.threadDumps.length
          ? "Uploaded and parsed \\o/"
          : <div className="dropzone-inner">Drop files here or click to load and parse.</div>
        }
      </Dropzone>
    )
  }
}

export default App;
