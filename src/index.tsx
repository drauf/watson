import { createRoot } from 'react-dom/client';
import { clearOldData } from './common/threadDumpsStorageService';
import './index.css';
import App from './App';
import '@atlaskit/css-reset';

clearOldData();

const domNode = document.getElementById('root');
if (domNode === null) {
  throw new Error('Root element not found');
}

// StrictMode is intentionally omitted: its development-only double-render of effects
// exposes a portal cleanup bug in the current @atlaskit/modal-dialog and
// @atlaskit/dropdown-menu versions, leaving orphaned empty portal containers behind.
createRoot(domNode).render(<App />);
