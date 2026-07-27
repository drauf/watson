import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FullPageError from './FullPageError';

const renderWithRouter = (component: React.ReactElement) => render(
  <MemoryRouter>
    {component}
  </MemoryRouter>,
);

describe('FullPageError', () => {
  const defaultProps = {
    title: 'Error processing files',
    message: 'The selected files could not be processed.',
  };

  it('renders a labelled error region with its title and message', () => {
    renderWithRouter(<FullPageError {...defaultProps} />);

    expect(screen.getByRole('region', { name: 'Error processing files' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Error processing files' })).toBeInTheDocument();
    expect(screen.getByText('The selected files could not be processed.')).toBeInTheDocument();
  });

  it('keeps a long message available as body content', () => {
    const message = 'This message is deliberately long so that the error surface must wrap it instead of discarding the useful diagnostic information.';
    renderWithRouter(<FullPageError {...defaultProps} message={message} />);

    expect(screen.getByText(message)).not.toHaveAttribute('title');
  });

  it('preserves line breaks in diagnostic messages', () => {
    const message = 'First diagnostic line\nSecond diagnostic line';
    renderWithRouter(<FullPageError {...defaultProps} message={message} />);

    expect(screen.getByText((_, element) => (
      element?.tagName === 'P' && element.textContent === message
    ))).toBeInTheDocument();
  });

  it('renders an enabled retry button', () => {
    renderWithRouter(<FullPageError {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: 'Try again' });
    retryButton.focus();
    fireEvent.click(retryButton);

    expect(retryButton).toHaveAttribute('type', 'button');
    expect(retryButton).toBeEnabled();
    expect(retryButton).toHaveFocus();
  });
});
