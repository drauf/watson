import { render, screen } from '@testing-library/react';
import NoCpuConsumersJfrDataError from './NoCpuConsumersJfrDataError';
import NoCpuInfosError from './NoCpuInfosError';
import NoThreadDumpsError from './NoThreadDumpsError';

describe('Error Components', () => {
  describe('NoCpuConsumersJfrDataError', () => {
    it('renders the JFR CPU data error message correctly', () => {
      render(<NoCpuConsumersJfrDataError />);

      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
        'You need to load thread_cpu_utilisation.txt file to see this data.',
      );
    });

    it('renders within main element with centered id', () => {
      render(<NoCpuConsumersJfrDataError />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'centered');
    });

    it('displays filename in code and italic formatting', () => {
      render(<NoCpuConsumersJfrDataError />);

      const codeElement = screen.getByText('thread_cpu_utilisation.txt');
      expect(codeElement.parentElement?.tagName.toLowerCase()).toBe('code');
      expect(codeElement.tagName.toLowerCase()).toBe('i');
    });
  });

  describe('NoCpuInfosError', () => {
    it('renders the CPU info error message correctly', () => {
      render(<NoCpuInfosError />);

      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
        'You need to load at least one file containing top output to see this data.',
      );
    });

    it('renders within main element with centered id', () => {
      render(<NoCpuInfosError />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'centered');
    });

    it('emphasizes "top output" text', () => {
      render(<NoCpuInfosError />);

      const emphasizedText = screen.getByText('top output');
      expect(emphasizedText.tagName.toLowerCase()).toBe('i');
    });
  });

  describe('NoThreadDumpsError', () => {
    it('renders the thread dumps error message correctly', () => {
      render(<NoThreadDumpsError />);

      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
        'You need to load at least one file containing thread dumps to see this data.',
      );
    });

    it('renders within main element with centered id', () => {
      render(<NoThreadDumpsError />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'centered');
    });

    it('emphasizes "thread dumps" text', () => {
      render(<NoThreadDumpsError />);

      const emphasizedText = screen.getByText('thread dumps');
      expect(emphasizedText.tagName.toLowerCase()).toBe('i');
    });
  });
});
