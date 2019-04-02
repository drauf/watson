import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import './App.css';
import Container from './components/Container';
import FullPageDropzone from './components/FullPageDropzone/FullPageDropzone';

const App: React.SFC<RouteComponentProps> = () => (
  <Switch>
    <Route exact path="/" component={FullPageDropzone} />
    <Route path="/:key" component={Container} />
  </Switch>
);

export default App;
