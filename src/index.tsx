import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import App from './App';
import './index.css';

ReactGA.initialize('UA-134928161-1', {
  gaOptions: {
    siteSpeedSampleRate: 100,
  },
});
ReactGA.pageview(window.location.href);

ReactDOM.render(<App />, document.getElementById('root'));
