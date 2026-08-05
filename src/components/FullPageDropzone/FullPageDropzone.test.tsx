import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import FullPageDropzone from './FullPageDropzone';
import ThreadDump from '../../types/ThreadDump';

// Mock dependencies
const parserMock = vi.hoisted(() => ({
  parseFiles: vi.fn(),
  onParsed: undefined as ((dumps: ThreadDump[]) => void) | undefined,
  onProgress: undefined as ((progress: any) => void) | undefined,
}));

vi.mock('../../common/threadDumpsStorageService', () => ({
  setParsedData: vi.fn(() => 'mock-data-key'),
}));

vi.mock('../../parser/AsyncParser', () => ({
  default: class {
    parseFiles = parserMock.parseFiles;

    constructor(onParsed: (dumps: ThreadDump[]) => void, onProgress: (progress: any) => void) {
      parserMock.onParsed = onParsed;
      parserMock.onProgress = onProgress;
    }
  },
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
  default: ({ title, message }: any) => (
    <div data-testid="full-page-error">
      <h4>{title}</h4>
      <p>{message}</p>
      <button type="button" onClick={() => window.location.reload()}>Try again</button>
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
    parserMock.parseFiles.mockReset();
    parserMock.onParsed = undefined;
    parserMock.onProgress = undefined;
  });

  describe('initial render', () => {
    it('renders dropzone with initial state', () => {
      renderComponent();

      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      expect(screen.getByText('Drop files or folders here, or click to browse')).toBeInTheDocument();
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
      parserMock.parseFiles.mockResolvedValue(undefined);

      renderComponent();

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(parserMock.parseFiles).toHaveBeenCalledWith([file]);
      });
    });

    it('does not process when no files are dropped', async () => {
      renderComponent();

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(parserMock.parseFiles).not.toHaveBeenCalled();
      });
    });

    it('disables dropzone while processing', async () => {
      let resolveParser: () => void;
      const parsePromise = new Promise<void>((resolve) => {
        resolveParser = resolve;
      });

      parserMock.parseFiles.mockReturnValue(parsePromise);

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
      parserMock.parseFiles.mockImplementation(() => {
        setTimeout(() => {
          parserMock.onProgress!({
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
    let consoleError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleError.mockRestore();
    });

    it('shows error when parsing fails', async () => {
      parserMock.parseFiles.mockRejectedValue(new Error('Parsing failed'));

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
      expect(consoleError).toHaveBeenCalledWith('Error parsing files:', expect.any(Error));
    });

    it('handles non-Error exceptions', async () => {
      parserMock.parseFiles.mockRejectedValue('String error');

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
      expect(consoleError).toHaveBeenCalledWith('Error parsing files:', 'String error');
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

      parserMock.parseFiles.mockImplementation(() => {
        setTimeout(() => {
          parserMock.onParsed!(mockThreadDumps);
        }, 10);
        return Promise.resolve();
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

      parserMock.parseFiles.mockImplementation(() => {
        setTimeout(() => {
          parserMock.onParsed!(mockThreadDumps);
        }, 10);
        return Promise.resolve();
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
});
