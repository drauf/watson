import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withThreadDumps as page } from '../common/withThreadDumps';
import './Container.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import Navigation from './Navigation/Navigation';
import PageNotFoundError from './Errors/PageNotFoundError';
import SimilarStacksPage from './SimilarStacks/SimilarStacksPage';
import StuckThreadsPage from './StuckThreads/StuckThreadsPage';
import SummaryPage from './Summary/SummaryPage';
import ThreadsOverviewPage from './ThreadsOverview/ThreadsOverviewPage';
import FlameGraphPage from './FlameGraph/FlameGraphPage';

export default class Container extends React.PureComponent {
  public render(): JSX.Element {
    return (
      <>
        <Navigation />

        <Switch>
          <Route exact path="/:key/summary/" component={page(SummaryPage)} />
          <Route exact path="/:key/cpu-consumers/" component={page(CpuConsumersPage)} />
          <Route exact path="/:key/similar-stacks/" component={page(SimilarStacksPage)} />
          <Route exact path="/:key/stuck-threads/" component={page(StuckThreadsPage)} />
          <Route exact path="/:key/monitors/" component={page(MonitorsPage)} />
          <Route exact path="/:key/flame-graph/" component={page(FlameGraphPage)} />
          <Route exact path="/:key/threads-overview/" component={page(ThreadsOverviewPage)} />
          <Route component={page(PageNotFoundError)} />
        </Switch>
      </>
    );
  }
}
