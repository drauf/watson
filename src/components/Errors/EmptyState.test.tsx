import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders its title and description inline', () => {
    render(
      <EmptyState
        fullPage={false}
        title="No matching threads"
        description="Change the filters and try again."
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'No matching threads' })).toBeInTheDocument();
    expect(screen.getByText('Change the filters and try again.')).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('centers its content when used as a full-page state', () => {
    render(
      <EmptyState
        fullPage
        title="No thread dumps found"
        description="Upload at least one thread dump to use this view."
      />,
    );

    expect(screen.getByRole('main')).toHaveAttribute('id', 'centered');
  });
});
