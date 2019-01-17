import React from 'react';
import ThreadDump from '../types/ThreadDump';
import './Container.css';
import Content from './Content';
import Nav from './Navigation/Nav';
import NavToggle from './Navigation/NavToggle';

export enum Page {
  Summary = 'summary',
  CpuConsumers = 'cpu-consumers',
  ThreadStatuses = 'thread-statuses',
  StuckThreads = 'stuck-threads',
  SimilarStackTraces = 'similar-stacktraces',
  ThreadsOverview = 'threads-overview',
  Monitors = 'monitors',
  FlameGraph = 'flame-graph',
  AdvancedMode = 'advanced-mode',
}

type ContainerProps = {
  threadDumps: ThreadDump[];
};

type ContainerState = {
  navigationOpen: boolean;
  selectedPage: Page;
};

export default class Container extends React.PureComponent<ContainerProps, ContainerState> {

  public state: ContainerState = {
    navigationOpen: true,
    selectedPage: Page.Summary,
  };

  public toggleNavigation = () => {
    this.setState(prevState => ({ navigationOpen: !prevState.navigationOpen }));
  }

  public selectPage = (selectedPage: Page) => {
    this.setState({ selectedPage });
  }

  public render() {
    return (
      <div className={this.state.navigationOpen ? 'container open' : 'container'}>
        <Nav open={this.state.navigationOpen} selectPage={this.selectPage} />
        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />
        <Content selectedPage={this.state.selectedPage} threadDumps={this.props.threadDumps} />
      </div>
    );
  }
}
