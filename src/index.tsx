import React from 'react';
import { createRoot } from 'react-dom/client';
import { clearOldData } from './common/threadDumpsStorageService';
import './index.css';
import App from './App';

clearOldData();

const domNode = document.getElementById('root');
if (domNode === null) {
  throw new Error('Root element not found');
}

createRoot(domNode).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
