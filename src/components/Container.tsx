import React from 'react';
import ReactGA from 'react-ga';
import { Route, Switch } from 'react-router-dom';
import { withThreadDumps as page } from '../common/withThreadDumps';
import './Container.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import Navigation from './Navigation/Navigation';
import NavToggle from './Navigation/NavToggle';
import NotFoundError from './NotFoundError';
import SimilarStacksPage from './SimilarStacks/SimilarStacksPage';
import StuckThreadsPage from './StuckThreads/StuckThreadsPage';
import SummaryPage from './Summary/SummaryPage';
import ThreadsOverviewPage from './ThreadsOverview/ThreadsOverviewPage';

type ContainerState = {
  navigationOpen: boolean;
};

class Container extends React.PureComponent<any, ContainerState> {

  public state: ContainerState = {
    navigationOpen: true,
  };

  public componentDidMount() {
    this.scrollToTop();
  }

  public render() {
    return (
      <div id="container">
        <Navigation open={this.state.navigationOpen} />

        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />

        <div id="content">
          <Switch>
            <Route exact path="/:key/summary/" component={page(SummaryPage)} />
            <Route exact path="/:key/cpu-consumers/" component={page(CpuConsumersPage)} />
            <Route exact path="/:key/similar-stacks/" component={page(SimilarStacksPage)} />
            <Route exact path="/:key/stuck-threads/" component={page(StuckThreadsPage)} />
            <Route exact path="/:key/threads-overview/" component={page(ThreadsOverviewPage)} />
            <Route exact path="/:key/monitors/" component={page(MonitorsPage)} />
            <Route component={page(NotFoundError)} />
          </Switch>
        </div>
      </div>
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

  private scrollToTop = () => {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.scrollTop = 0;
    }
  }
}

export default Container;
