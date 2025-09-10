import { render, screen } from '@testing-library/react';
import NoThreadDumpsError from './NoThreadDumpsError';

describe('NoThreadDumpsError', () => {
  it('renders the error message correctly', () => {
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
