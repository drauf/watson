import React from 'react';
import ReactGA from 'react-ga';
import './App.css';
import Container from './components/Container';
import FullPageDropzone from './components/FullPageDropzone/FullPageDropzone';
import Parser from './parser/Parser';
import ThreadDump from './types/ThreadDump';

type AppState = {
  threadDumps: ThreadDump[];
  parser: Parser;
};

export default class App extends React.PureComponent<any, AppState> {
  public state: AppState = {
    parser: new Parser(this.handleFilesParsed.bind(this)),
    threadDumps: [],
  };

  public render() {
    if (this.state.threadDumps.length === 0) {
      return <FullPageDropzone onDrop={this.state.parser.parseFiles} />;
    }
    return (
      <Container threadDumps={this.state.threadDumps} clearThreadDumps={this.clearThreadDumps} />
    );
  }

  private handleFilesParsed(threadDumps: ThreadDump[]) {
    this.setState({ threadDumps });
  }

  private clearThreadDumps = () => {
    ReactGA.event({
      action: 'Cleared thread dumps',
      category: 'Navigation',
    });

    this.setState({ threadDumps: [] });
  }
}
