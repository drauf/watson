import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withThreadDumps as page } from '../common/withThreadDumps';
import './Container.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import Navigation from './Navigation/Navigation';
import NotFoundError from './NotFoundError';
import SimilarStacksPage from './SimilarStacks/SimilarStacksPage';
import StuckThreadsPage from './StuckThreads/StuckThreadsPage';
import SummaryPage from './Summary/SummaryPage';
import ThreadsOverviewPage from './ThreadsOverview/ThreadsOverviewPage';

const Container: React.FunctionComponent = () => (
  <>
    <Navigation />

    <Switch>
      <Route exact path="/:key/summary/" component={page(SummaryPage)} />
      <Route exact path="/:key/cpu-consumers/" component={page(CpuConsumersPage)} />
      <Route exact path="/:key/similar-stacks/" component={page(SimilarStacksPage)} />
      <Route exact path="/:key/stuck-threads/" component={page(StuckThreadsPage)} />
      <Route exact path="/:key/threads-overview/" component={page(ThreadsOverviewPage)} />
      <Route exact path="/:key/monitors/" component={page(MonitorsPage)} />
      <Route component={page(NotFoundError)} />
    </Switch>
  </>
);

export default Container;
