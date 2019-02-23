import React from 'react';
import ReactGA from 'react-ga';
import ThreadDump from '../types/ThreadDump';
import './Container.css';
import Content from './Content';
import Navigation from './Navigation/Navigation';
import NavToggle from './Navigation/NavToggle';

export enum Page {
  Summary = 'summary',
  CpuConsumers = 'cpu-consumers',
  SimilarStacks = 'similar-stacks',
  ThreadsOverview = 'threads-overview',
  Monitors = 'monitors',
}

type ContainerProps = {
  threadDumps: ThreadDump[];
  clearThreadDumps: () => void;
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

  public componentDidMount() {
    this.scrollToTop();
  }

  public render() {
    return (
      <div id="container">
        <Navigation
          open={this.state.navigationOpen}
          onPageSelect={this.handlePageSelect}
          clearThreadDumps={this.props.clearThreadDumps}
        />

        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />

        <div id="content">
          <Content selectedPage={this.state.selectedPage} threadDumps={this.props.threadDumps} />
        </div>
      </div >
    );
  }

  private toggleNavigation = () => {
    this.setState((prevState) => {
      const isOpen = !prevState.navigationOpen;

      ReactGA.event({
        action: isOpen ? 'Navigation toggled open' : 'Navigation toggled close',
        category: 'Navigation',
      });

      return { navigationOpen: isOpen };
    });
  }

  private handlePageSelect = (selectedPage: Page) => {
    if (selectedPage !== this.state.selectedPage) {
      ReactGA.event({
        action: 'Page changed',
        category: 'Navigation',
        label: selectedPage,
      });

      this.setState({ selectedPage });
      this.scrollToTop();
    }
  }

  private scrollToTop = () => {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.scrollTop = 0;
    }
  }
}
