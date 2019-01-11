import * as React from 'react';
import './Container.css';
import Content from './Content';
import Nav from './Nav';
import NavToggle from './NavToggle';

export enum Page {
  Summary,
  CpuConsumers,
  ThreadStatuses,
  StuckThreads,
  SimilarStackTraces,
  ThreadsOverview,
  Monitors,
  FlameGraph,
  AdvancedMode
}

interface ContainerState {
  navigationOpen: boolean;
  selectedPage: Page;
}

class Container extends React.Component<any, ContainerState> {
  public state: ContainerState = {
    navigationOpen: true,
    selectedPage: Page.Summary
  }

  public toggleNavigation = () => {
    this.setState((prevState) => ({ navigationOpen: !prevState.navigationOpen }))
  }

  public selectPage = (selectedPage: Page) => {
    this.setState({ selectedPage })
  }

  public render() {
    return (
      <div className="container">
        <Nav open={this.state.navigationOpen} selectPage={this.selectPage} />
        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />
        <Content selectedPage={this.state.selectedPage} />
      </div>
    )
  }
}

export default Container;
