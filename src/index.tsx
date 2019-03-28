import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './App';
import './index.css';
import { withTracker } from './withTracker';

ReactGA.initialize('UA-134928161-1', {
  gaOptions: {
    siteSpeedSampleRate: 100,
  },
});

ReactDOM.render(
  <Router>
    <Route component={withTracker(App, {})} />
  </Router>,
  document.getElementById('root'),
);
