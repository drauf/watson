import React from 'react';
import { createRoot } from 'react-dom/client';
import { clearOldData } from './common/threadDumpsStorageService';
import './index.css';
import App from './App';

clearOldData();

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
