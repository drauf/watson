import * as React from 'react';
import './App.css';
import Container from './components/Container';
import FullPageDropzone from './components/FullPageDropzone/FullPageDropzone';
import Parser from './parser/Parser';
import ThreadDump from './types/ThreadDump';

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
    if (this.state.threadDumps.length === 0) {
      return <FullPageDropzone onDrop={this.state.parser.parseFiles} />
    }
    return <Container />
  }
}

export default App;
