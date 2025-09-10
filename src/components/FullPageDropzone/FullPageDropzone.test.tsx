/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */

import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import FullPageDropzone from './FullPageDropzone';
import ThreadDump from '../../types/ThreadDump';

// Mock dependencies
vi.mock('../../common/threadDumpsStorageService', () => ({
  setParsedData: vi.fn(() => 'mock-data-key'),
}));

vi.mock('../../parser/AsyncParser', () => ({
  default: vi.fn(),
}));

vi.mock('../ProgressIndicator/ProgressIndicator', () => ({
  default: ({ progress }: any) => (
    <div data-testid="progress-indicator">
      Progress:
      {' '}
      {progress.percentage}
      % -
      {' '}
      {progress.phase}
    </div>
  ),
}));

vi.mock('../Errors/FullPageError', () => ({
  default: ({ title, message, onRetry }: any) => (
    <div data-testid="full-page-error">
      <h4>{title}</h4>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  ),
}));

vi.mock('./DropzoneGuide', () => ({
  default: () => <div data-testid="dropzone-guide">Dropzone Guide</div>,
}));

vi.mock('react-dropzone', () => ({
  default: ({
    children, onDrop, disabled, multiple,
  }: any) => {
    const mockGetRootProps = () => ({
      'data-testid': 'dropzone',
      onClick: () => {},
    });
    const mockGetInputProps = () => ({
      type: 'file',
      multiple,
      onChange: (e: any) => {
        if (e.target.files) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          onDrop(Array.from(e.target.files));
        }
      },
    });

    return (
      <div data-disabled={disabled}>
        {children({
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
        })}
      </div>
    );
  },
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const actual = await vi.importActual('react-router-dom') as Record<string, any>;
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

describe('FullPageDropzone', () => {
  const renderComponent = () => render(
    <BrowserRouter>
      <FullPageDropzone />
    </BrowserRouter>,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('renders dropzone with initial state', () => {
      renderComponent();

      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      expect(screen.getByText('Drop a catalog here, or click to select files to load.')).toBeInTheDocument();
      expect(screen.getByTestId('dropzone-guide')).toBeInTheDocument();
    });

    it('renders file input with correct attributes', () => {
      renderComponent();

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('multiple');
    });

    it('dropzone is not disabled initially', () => {
      renderComponent();

      const dropzoneContainer = screen.getByTestId('dropzone').parentElement;
      expect(dropzoneContainer).toHaveAttribute('data-disabled', 'false');
    });
  });

  describe('file dropping and parsing', () => {
    it('handles file drop with valid files', async () => {
      const mockParser = {
        parseFiles: vi.fn().mockResolvedValue(undefined),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockParser.parseFiles).toHaveBeenCalledWith([file]);
      });
    });

    it('does not process when no files are dropped', async () => {
      const mockParser = {
        parseFiles: vi.fn(),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockParser.parseFiles).not.toHaveBeenCalled();
      });
    });

    it('disables dropzone while processing', async () => {
      let resolveParser: () => void;
      const parsePromise = new Promise<void>((resolve) => {
        resolveParser = resolve;
      });

      const mockParser = {
        parseFiles: vi.fn().mockReturnValue(parsePromise),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        const dropzoneContainer = screen.getByTestId('dropzone').parentElement;
        expect(dropzoneContainer).toHaveAttribute('data-disabled', 'true');
      });

      // Resolve the parsing
      resolveParser!();
    });
  });

  describe('progress indication', () => {
    it('shows progress indicator during parsing', async () => {
      let onProgressCallback: (progress: any) => void;

      const mockParser = {
        parseFiles: vi.fn().mockImplementation(() => {
          // Simulate progress callback
          setTimeout(() => {
            onProgressCallback({
              phase: 'parsing',
              percentage: 50,
              fileName: 'test.txt',
              filesProcessed: 1,
              totalFiles: 2,
              linesProcessed: 100,
              totalLines: 200,
            });
          }, 10);
          return Promise.resolve();
        }),
      };

      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation((_onParsed: any, onProgress: any) => {
        onProgressCallback = onProgress;
        return mockParser;
      });

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
        expect(screen.getByText(/Progress: 50% - parsing/)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows error when parsing fails', async () => {
      const mockParser = {
        parseFiles: vi.fn().mockRejectedValue(new Error('Parsing failed')),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('full-page-error')).toBeInTheDocument();
        expect(screen.getByText('Error processing files')).toBeInTheDocument();
        expect(screen.getByText('Parsing failed')).toBeInTheDocument();
      });
    });

    it('handles non-Error exceptions', async () => {
      const mockParser = {
        parseFiles: vi.fn().mockRejectedValue('String error'),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('An error occurred while parsing files')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const mockParser = {
        parseFiles: vi.fn().mockRejectedValue(new Error('Parsing failed')),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      // Trigger error
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('full-page-error')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText('Try again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-error')).not.toBeInTheDocument();
        expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      });
    });
  });

  describe('navigation after successful parsing', () => {
    it('navigates to summary when CPU usage info is available', async () => {
      const mockThreadDumps = [
        {
          threads: [
            { cpuUsage: '5.50' }, // Non-zero CPU usage
            { cpuUsage: '0.00' },
          ],
        },
      ] as ThreadDump[];

      let onParsedCallback: (dumps: ThreadDump[]) => void;

      const mockParser = {
        parseFiles: vi.fn().mockImplementation(() => {
          setTimeout(() => {
            onParsedCallback(mockThreadDumps);
          }, 10);
          return Promise.resolve();
        }),
      };

      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation((onParsed: any) => {
        onParsedCallback = onParsed;
        return mockParser;
      });

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        const navigate = screen.getByTestId('navigate');
        expect(navigate).toHaveAttribute('data-to', '/mock-data-key/summary');
      });
    });

    it('navigates to similar-stacks when no CPU usage info is available', async () => {
      const mockThreadDumps = [
        {
          threads: [
            { cpuUsage: '0.00' },
            { cpuUsage: '0.00' },
          ],
        },
      ] as ThreadDump[];

      let onParsedCallback: (dumps: ThreadDump[]) => void;

      const mockParser = {
        parseFiles: vi.fn().mockImplementation(() => {
          setTimeout(() => {
            onParsedCallback(mockThreadDumps);
          }, 10);
          return Promise.resolve();
        }),
      };

      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation((onParsed: any) => {
        onParsedCallback = onParsed;
        return mockParser;
      });

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        const navigate = screen.getByTestId('navigate');
        expect(navigate).toHaveAttribute('data-to', '/mock-data-key/similar-stacks');
      });
    });
  });

  describe('component lifecycle', () => {
    it('has correct initial state', () => {
      renderComponent();

      // Should show the dropzone, not progress or error
      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      expect(screen.queryByTestId('progress-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('full-page-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('clears error and progress when starting new parsing', async () => {
      // First, trigger an error
      const mockParser = {
        parseFiles: vi.fn().mockRejectedValue(new Error('First error')),
      };
      const AsyncParser = await import('../../parser/AsyncParser');
      (AsyncParser.default as any).mockImplementation(() => mockParser);

      renderComponent();

      const file1 = new File(['test content'], 'test1.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file1],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('full-page-error')).toBeInTheDocument();
      });

      // Click retry to go back to dropzone
      fireEvent.click(screen.getByText('Try again'));

      await waitFor(() => {
        expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      });

      // Now mock successful parsing
      mockParser.parseFiles.mockResolvedValue(undefined);

      const file2 = new File(['test content 2'], 'test2.txt', { type: 'text/plain' });
      Object.defineProperty(input, 'files', {
        value: [file2],
        configurable: true,
      });

      fireEvent.change(input);

      // Should not show error anymore
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-error')).not.toBeInTheDocument();
      });
    });
  });
});
