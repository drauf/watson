import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import App from './App';
import { clearOldThreadDumps } from './common/threadDumpsStorageService';
import './index.css';

clearOldThreadDumps();

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route component={App} />
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);
