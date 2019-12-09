import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter, Route } from 'react-router-dom';
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
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Route component={withTracker(App, {})} />
  </BrowserRouter>,
  document.getElementById('root'),
);
