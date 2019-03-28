import React from 'react';
import { Route, Switch } from 'react-router-dom';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import NotFoundError from './NotFoundError';
import SimilarStacksPage from './SimilarStacks/SimilarStacksPage';
import SummaryPage from './Summary/SummaryPage';
import ThreadsOverviewPage from './ThreadsOverview/ThreadsOverviewPage';

const Content: React.SFC = () => (
  <Switch>
    <Route path="/summary/" component={SummaryPage} />
    <Route path="/cpu-consumers/" component={CpuConsumersPage} />
    <Route path="/similar-stacks/" component={SimilarStacksPage} />
    <Route path="/threads-overview/" component={ThreadsOverviewPage} />
    <Route path="/monitors/" component={MonitorsPage} />
    <Route component={NotFoundError} />
  </Switch>
);

export default Content;
