import { render, screen } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';
import { ParseProgress } from '../../parser/AsyncParser';

describe('ProgressIndicator', () => {
  const createMockProgress = (overrides: Partial<ParseProgress> = {}): ParseProgress => ({
    phase: 'parsing',
    fileName: 'test.txt',
    filesProcessed: 1,
    totalFiles: 3,
    linesProcessed: 50,
    totalLines: 100,
    percentage: 50,
    ...overrides,
  });

  describe('rendering', () => {
    it('renders progress container', () => {
      const progress = createMockProgress();
      const { container } = render(<ProgressIndicator progress={progress} />);

      expect(container.querySelector('#progress-container')).toBeInTheDocument();
    });

    it('displays correct percentage', () => {
      const progress = createMockProgress({ percentage: 75 });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('rounds percentage to nearest integer', () => {
      const progress = createMockProgress({ percentage: 75.7 });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('76%')).toBeInTheDocument();
    });

    it('sets progress bar width correctly', () => {
      const progress = createMockProgress({ percentage: 60 });
      render(<ProgressIndicator progress={progress} />);

      const progressBar = document.querySelector('.progress-fill');
      expect(progressBar).toHaveStyle('width: 60%');
    });
  });

  describe('phase text', () => {
    it('displays "Reading files" for reading phase', () => {
      const progress = createMockProgress({ phase: 'reading' });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Reading files')).toBeInTheDocument();
    });

    it('displays "Analyzing thread dumps" for parsing phase', () => {
      const progress = createMockProgress({ phase: 'parsing' });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Analyzing thread dumps')).toBeInTheDocument();
    });

    it('displays "Finalizing analysis" for grouping phase', () => {
      const progress = createMockProgress({ phase: 'grouping' });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Finalizing analysis')).toBeInTheDocument();
    });

    it('displays "Analysis complete" for complete phase', () => {
      const progress = createMockProgress({ phase: 'complete' });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Analysis complete')).toBeInTheDocument();
    });
  });

  describe('detail text', () => {
    it('shows file count for multiple files', () => {
      const progress = createMockProgress({
        filesProcessed: 1,
        totalFiles: 3,
        phase: 'parsing',
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('File 2 of 3')).toBeInTheDocument();
    });

    it('shows "Processing file" for single file', () => {
      const progress = createMockProgress({
        filesProcessed: 0,
        totalFiles: 1,
        phase: 'parsing',
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Processing file')).toBeInTheDocument();
    });

    it('shows completion message when complete', () => {
      const progress = createMockProgress({
        phase: 'complete',
        totalFiles: 3,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Successfully processed 3 files')).toBeInTheDocument();
    });

    it('shows singular file message when one file is complete', () => {
      const progress = createMockProgress({
        phase: 'complete',
        totalFiles: 1,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Successfully processed 1 file')).toBeInTheDocument();
    });

    it('shows grouping message during grouping phase', () => {
      const progress = createMockProgress({ phase: 'grouping' });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('Grouping CPU usage data with thread dumps')).toBeInTheDocument();
    });
  });

  describe('file name display', () => {
    it('shows current file name during processing phases', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        fileName: 'thread_dump_1.txt',
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('thread_dump_1.txt')).toBeInTheDocument();
    });

    it('does not show file name during complete phase', () => {
      const progress = createMockProgress({
        phase: 'complete',
        fileName: 'thread_dump_1.txt',
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.queryByText('thread_dump_1.txt')).not.toBeInTheDocument();
    });

    it('does not show file name during grouping phase', () => {
      const progress = createMockProgress({
        phase: 'grouping',
        fileName: 'thread_dump_1.txt',
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.queryByText('thread_dump_1.txt')).not.toBeInTheDocument();
    });

    it('adds title attribute to file name for accessibility', () => {
      const progress = createMockProgress({
        phase: 'reading',
        fileName: 'very_long_file_name.txt',
      });
      render(<ProgressIndicator progress={progress} />);

      const fileNameElement = screen.getByText('very_long_file_name.txt');
      expect(fileNameElement).toHaveAttribute('title', 'very_long_file_name.txt');
    });
  });

  describe('line processing display', () => {
    it('shows line progress during parsing phase', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        linesProcessed: 1500,
        totalLines: 3000,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText(/1,500.*\/.*3,000.*lines/)).toBeInTheDocument();
    });

    it('does not show line progress when totalLines is 0', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        linesProcessed: 0,
        totalLines: 0,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.queryByText(/lines/)).not.toBeInTheDocument();
    });

    it('does not show line progress during non-parsing phases', () => {
      const progress = createMockProgress({
        phase: 'reading',
        linesProcessed: 100,
        totalLines: 200,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.queryByText(/lines/)).not.toBeInTheDocument();
    });

    it('formats large numbers with thousand separators', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        linesProcessed: 123456,
        totalLines: 987654,
      });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText(/123,456.*\/.*987,654.*lines/)).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('applies correct CSS classes to elements', () => {
      const progress = createMockProgress();
      const { container } = render(<ProgressIndicator progress={progress} />);

      expect(container.querySelector('.progress-indicator')).toBeInTheDocument();
      expect(container.querySelector('.progress-header')).toBeInTheDocument();
      expect(container.querySelector('.progress-percentage')).toBeInTheDocument();
      expect(container.querySelector('.progress-bar')).toBeInTheDocument();
      expect(container.querySelector('.progress-fill')).toBeInTheDocument();
      expect(container.querySelector('.progress-details')).toBeInTheDocument();
      expect(container.querySelector('.progress-file')).toBeInTheDocument();
    });

    it('applies progress-file-name class when file name is shown', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        fileName: 'test.txt',
      });
      const { container } = render(<ProgressIndicator progress={progress} />);

      expect(container.querySelector('.progress-file-name')).toBeInTheDocument();
    });

    it('applies progress-lines class when line info is shown', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        linesProcessed: 50,
        totalLines: 100,
      });
      const { container } = render(<ProgressIndicator progress={progress} />);

      expect(container.querySelector('.progress-lines')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero percentage', () => {
      const progress = createMockProgress({ percentage: 0 });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('0%')).toBeInTheDocument();

      const progressBar = document.querySelector('.progress-fill');
      expect(progressBar).toHaveStyle('width: 0%');
    });

    it('handles 100 percentage', () => {
      const progress = createMockProgress({ percentage: 100 });
      render(<ProgressIndicator progress={progress} />);

      expect(screen.getByText('100%')).toBeInTheDocument();

      const progressBar = document.querySelector('.progress-fill');
      expect(progressBar).toHaveStyle('width: 100%');
    });

    it('handles empty file name', () => {
      const progress = createMockProgress({
        phase: 'parsing',
        fileName: '',
      });
      const { container } = render(<ProgressIndicator progress={progress} />);

      // Should not render file name element when fileName is empty
      expect(container.querySelector('.progress-file-name')).not.toBeInTheDocument();
    });
  });
});
