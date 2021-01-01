import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import App from './App';
import { clearOldThreadDumps } from './common/threadDumpsStorageService';
import './index.css';

clearOldThreadDumps();

ReactDOM.render(
  <Router>
    <Route component={App} />
  </Router>,
  document.getElementById('root'),
);
