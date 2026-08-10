import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import ThreadDump from './types/ThreadDump';

let resolveThreadDumps: (threadDumps: ThreadDump[]) => void;

const getThreadDumpsAsync = vi.fn(() => new Promise<ThreadDump[]>((resolve) => {
  resolveThreadDumps = resolve;
}));

vi.mock('./common/threadDumpsStorageService', () => ({
  clearCurrentData: vi.fn(),
  getThreadDumpsAsync,
  setParsedData: vi.fn(),
}));

afterEach(() => {
  document.getElementById('initial-loading')?.remove();
  window.location.hash = '';
  vi.clearAllMocks();
});

describe('App', () => {
  it('keeps the static loading message visible until stored thread dumps are loaded', async () => {
    document.body.insertAdjacentHTML('afterbegin', `
      <div id="initial-loading">
        <h2>Loading thread dumps from local storage...</h2>
      </div>
    `);
    window.location.hash = '#/stored-dumps/summary';
    const { default: App } = await import('./App');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Loading thread dumps from local storage...' })).toBeInTheDocument();

    resolveThreadDumps([]);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Loading thread dumps from local storage...' })).not.toBeInTheDocument();
    });
  });
});
