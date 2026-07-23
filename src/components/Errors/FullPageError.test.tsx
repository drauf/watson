import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FullPageError from './FullPageError';

// Wrapper component for tests that need Router context
const renderWithRouter = (component: React.ReactElement) => render(
  <MemoryRouter>
    {component}
  </MemoryRouter>,
);

describe('FullPageError', () => {
  const defaultProps = {
    title: 'Test error',
    message: 'Something went wrong',
  };

  describe('rendering', () => {
    it('renders error container', () => {
      const { container } = renderWithRouter(<FullPageError {...defaultProps} />);
      expect(container.querySelector('#error-container')).toBeInTheDocument();
    });

    it('displays the error title', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Test error');
    });

    it('displays the error message', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('adds title attribute to error message for accessibility', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);
      const messageElement = screen.getByText('Something went wrong');
      expect(messageElement).toHaveAttribute('title', 'Something went wrong');
    });

    it('applies correct CSS classes', () => {
      const { container } = renderWithRouter(<FullPageError {...defaultProps} />);

      expect(container.querySelector('.error-indicator')).toBeInTheDocument();
      expect(container.querySelector('.error-header')).toBeInTheDocument();
      expect(container.querySelector('.error-details')).toBeInTheDocument();
      expect(container.querySelector('.error-message')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('shows retry button', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });

    it('applies correct CSS classes to retry elements', () => {
      const { container } = renderWithRouter(<FullPageError {...defaultProps} />);

      expect(container.querySelector('.error-actions')).toBeInTheDocument();
      expect(container.querySelector('.retry-button')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Test error');
    });

    it('has accessible button when retry is available', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
    });

    it('provides tooltip for long error messages', () => {
      const longMessage = 'This is a very long error message that might be truncated in the UI but should be fully available in the title attribute for accessibility';
      renderWithRouter(<FullPageError {...defaultProps} message={longMessage} />);

      const messageElement = screen.getByText(longMessage);
      expect(messageElement).toHaveAttribute('title', longMessage);
    });
  });

  describe('edge cases', () => {
    it('handles empty title', () => {
      renderWithRouter(<FullPageError {...defaultProps} title="" />);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('');
    });

    it('handles empty message', () => {
      const { container } = renderWithRouter(<FullPageError {...defaultProps} message="" />);

      const messageElement = container.querySelector('.error-message');
      expect(messageElement).toHaveTextContent('');
      expect(messageElement).toHaveAttribute('title', '');
    });

    it('handles special characters in title and message', () => {
      const specialTitle = 'Error: <>&"\'';
      const specialMessage = 'Message with special chars: <>&"\'';

      renderWithRouter(<FullPageError title={specialTitle} message={specialMessage} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('handles multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const { container } = renderWithRouter(<FullPageError {...defaultProps} message={multilineMessage} />);

      const messageElement = container.querySelector('.error-message');
      // HTML normalizes newlines to spaces in text content
      expect(messageElement).toHaveTextContent('Line 1 Line 2 Line 3');
      // But the title attribute preserves the original newlines
      expect(messageElement).toHaveAttribute('title', multilineMessage);
    });
  });

  describe('interaction', () => {
    it('retry button can be activated with keyboard', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);

      const retryButton = screen.getByRole('button');

      // Test that button is focusable for keyboard navigation
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });

    it('handles multiple clicks', () => {
      renderWithRouter(<FullPageError {...defaultProps} />);

      const retryButton = screen.getByRole('button');

      // Test that button can be clicked multiple times
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      // Button remains clickable
      expect(retryButton).toBeEnabled();
    });
  });

  describe('component props validation', () => {
    it('renders correctly with minimal required props', () => {
      renderWithRouter(<FullPageError title="Title" message="Message" />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('renders correctly with all props', () => {
      renderWithRouter(
        <FullPageError
          title="Custom Title"
          message="Custom Message"
        />,
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });
});
