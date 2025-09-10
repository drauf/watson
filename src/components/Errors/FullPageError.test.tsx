/* eslint-disable react/jsx-props-no-spreading */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FullPageError from './FullPageError';

describe('FullPageError', () => {
  const defaultProps = {
    title: 'Test error',
    message: 'Something went wrong',
  };

  describe('rendering', () => {
    it('renders error container', () => {
      const { container } = render(<FullPageError {...defaultProps} />);
      expect(container.querySelector('#error-container')).toBeInTheDocument();
    });

    it('displays the error title', () => {
      render(<FullPageError {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Test error');
    });

    it('displays the error message', () => {
      render(<FullPageError {...defaultProps} />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('adds title attribute to error message for accessibility', () => {
      render(<FullPageError {...defaultProps} />);
      const messageElement = screen.getByText('Something went wrong');
      expect(messageElement).toHaveAttribute('title', 'Something went wrong');
    });

    it('applies correct CSS classes', () => {
      const { container } = render(<FullPageError {...defaultProps} />);

      expect(container.querySelector('.error-indicator')).toBeInTheDocument();
      expect(container.querySelector('.error-header')).toBeInTheDocument();
      expect(container.querySelector('.error-details')).toBeInTheDocument();
      expect(container.querySelector('.error-message')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('shows retry button when onRetry prop is provided', () => {
      const onRetry = vi.fn();
      render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });

    it('does not show retry button when onRetry prop is not provided', () => {
      render(<FullPageError {...defaultProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Try again' });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('uses custom retry button text when provided', () => {
      const onRetry = vi.fn();
      render(
        <FullPageError
          {...defaultProps}
          onRetry={onRetry}
          retryButtonText="Retry Upload"
        />,
      );

      expect(screen.getByRole('button', { name: 'Retry Upload' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    });

    it('applies correct CSS classes to retry elements', () => {
      const onRetry = vi.fn();
      const { container } = render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      expect(container.querySelector('.error-actions')).toBeInTheDocument();
      expect(container.querySelector('.retry-button')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<FullPageError {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Test error');
    });

    it('has accessible button when retry is available', () => {
      const onRetry = vi.fn();
      render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
    });

    it('provides tooltip for long error messages', () => {
      const longMessage = 'This is a very long error message that might be truncated in the UI but should be fully available in the title attribute for accessibility';
      render(<FullPageError {...defaultProps} message={longMessage} />);

      const messageElement = screen.getByText(longMessage);
      expect(messageElement).toHaveAttribute('title', longMessage);
    });
  });

  describe('edge cases', () => {
    it('handles empty title', () => {
      render(<FullPageError {...defaultProps} title="" />);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('');
    });

    it('handles empty message', () => {
      const { container } = render(<FullPageError {...defaultProps} message="" />);

      const messageElement = container.querySelector('.error-message');
      expect(messageElement).toHaveTextContent('');
      expect(messageElement).toHaveAttribute('title', '');
    });

    it('handles special characters in title and message', () => {
      const specialTitle = 'Error: <>&"\'';
      const specialMessage = 'Message with special chars: <>&"\'';

      render(<FullPageError title={specialTitle} message={specialMessage} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('handles multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<FullPageError {...defaultProps} message={multilineMessage} />);

      const messageElement = container.querySelector('.error-message');
      // HTML normalizes newlines to spaces in text content
      expect(messageElement).toHaveTextContent('Line 1 Line 2 Line 3');
      // But the title attribute preserves the original newlines
      expect(messageElement).toHaveAttribute('title', multilineMessage);
    });
  });

  describe('interaction', () => {
    it('retry button can be activated with keyboard', () => {
      const onRetry = vi.fn();
      render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button');

      // Button responds to click events (keyboard activation is handled by browser)
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);

      // Test that button is focusable for keyboard navigation
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });

    it('handles multiple clicks', () => {
      const onRetry = vi.fn();
      render(<FullPageError {...defaultProps} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button');

      // Simulate multiple clicking
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      // Should be called for each click
      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('component props validation', () => {
    it('renders correctly with minimal required props', () => {
      render(<FullPageError title="Title" message="Message" />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('renders correctly with all optional props', () => {
      const onRetry = vi.fn();
      render(
        <FullPageError
          title="Custom Title"
          message="Custom Message"
          onRetry={onRetry}
          retryButtonText="Custom Retry"
        />,
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Custom Retry' })).toBeInTheDocument();
    });
  });
});
