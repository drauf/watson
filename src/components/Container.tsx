import React from 'react';
import ReactGA from 'react-ga';
import { Route, Switch } from 'react-router-dom';
import { withThreadDumps as withDumps } from '../common/withThreadDumps';
import './Container.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import Navigation from './Navigation/Navigation';
import NavToggle from './Navigation/NavToggle';
import NotFoundError from './NotFoundError';
import SimilarStacksPage from './SimilarStacks/SimilarStacksPage';
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
            <Route path="/:key/summary/" component={withDumps(SummaryPage)} />
            <Route path="/:key/cpu-consumers/" component={withDumps(CpuConsumersPage)} />
            <Route path="/:key/similar-stacks/" component={withDumps(SimilarStacksPage)} />
            <Route path="/:key/threads-overview/" component={withDumps(ThreadsOverviewPage)} />
            <Route path="/:key/monitors/" component={withDumps(MonitorsPage)} />
            <Route component={NotFoundError} />
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
