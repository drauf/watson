import { createRoot } from 'react-dom/client';
import '@atlaskit/css-reset';
import { clearOldData } from './common/threadDumpsStorageService';
import './index.css';
import App from './App';

clearOldData();

const domNode = document.getElementById('root');
if (domNode === null) {
  throw new Error('Root element not found');
}

// StrictMode is intentionally omitted: its development-only double-render of effects
// exposes a portal cleanup bug in the current @atlaskit/dropdown-menu version,
// leaving orphaned empty portal container behind.
createRoot(domNode).render(<App />);
