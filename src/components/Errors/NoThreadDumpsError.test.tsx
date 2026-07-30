import { render, screen } from '@testing-library/react';
import NoThreadDumpsError from './NoThreadDumpsError';

describe('NoThreadDumpsError', () => {
  it('renders a centered title and description', () => {
    render(<NoThreadDumpsError />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'centered');
    expect(screen.getByRole('heading')).toHaveTextContent('No thread dumps found');
    expect(screen.getByText('Upload at least one thread dump to use this view.')).toBeInTheDocument();
  });
});
