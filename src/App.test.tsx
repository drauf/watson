import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
