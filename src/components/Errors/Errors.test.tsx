import { render, screen } from '@testing-library/react';
import NoCpuConsumersJfrDataError from './NoCpuConsumersJfrDataError';
import NoCpuInfosError from './NoCpuInfosError';
import NoThreadDumpsError from './NoThreadDumpsError';

describe('no-data empty states', () => {
  it('explains missing thread CPU usage data', () => {
    render(<NoCpuConsumersJfrDataError />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No thread CPU usage data found');
    expect(screen.getByText(/Upload a JFR bundle containing thread CPU usage data/)).toBeInTheDocument();
  });

  it('explains missing CPU usage data', () => {
    render(<NoCpuInfosError />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No CPU usage data found');
    expect(screen.getByText(/Upload top output or a supported JFR/)).toBeInTheDocument();
  });

  it('explains missing thread dumps', () => {
    render(<NoThreadDumpsError />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No thread dumps found');
    expect(screen.getByText('Upload at least one thread dump to use this view.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'centered');
  });
});
