import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { HashRouter as Router, Route } from 'react-router-dom';
import App from './App';
import { clearOldThreadDumps } from './common/threadDumpsStorageService';
import { withTracker } from './common/withTracker';
import './index.css';

ReactGA.initialize('UA-134928161-1', {
  gaOptions: {
    siteSpeedSampleRate: 100,
  },
});

clearOldThreadDumps();

ReactDOM.render(
  <Router>
    <Route component={withTracker(App, {})} />
  </Router>,
  document.getElementById('root'),
);
