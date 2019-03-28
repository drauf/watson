import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import './App.css';
import Container from './components/Container';
import FullPageDropzone from './components/FullPageDropzone/FullPageDropzone';
import ThreadDump from './types/ThreadDump';

let threadDumps: ThreadDump[] = [];

export const getThreadDumps = (): ThreadDump[] => (
  threadDumps
);

export const setThreadDumps = (parsedDumps: ThreadDump[]): void => {
  threadDumps = parsedDumps;
};

export const clearThreadDumps = (): void => {
  threadDumps = [];
};

const App: React.SFC<RouteComponentProps> = () => (
  <Switch>
    <Route exact={true} path="/" component={FullPageDropzone} />
    <Route component={Container} />
  </Switch>
);

export default App;
