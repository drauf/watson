import { render, screen } from '@testing-library/react';
import NoCpuConsumersJfrDataError from './NoCpuConsumersJfrDataError';
import NoCpuInfosError from './NoCpuInfosError';
import NoThreadDumpsError from './NoThreadDumpsError';
import NoCpuInfosAndThreadDumpPairError from './NoCpuInfosAndThreadDumpPairError';
import PageNotFoundError from './PageNotFoundError';

describe('no-data empty states', () => {
  it('explains missing thread CPU usage data', () => {
    render(<NoCpuConsumersJfrDataError />);

    expect(screen.getByRole('heading')).toHaveTextContent('No thread CPU usage data found');
    expect(screen.getByText(/Upload a JFR bundle containing thread CPU usage data/)).toBeInTheDocument();
  });

  it('explains missing CPU usage data', () => {
    render(<NoCpuInfosError />);

    expect(screen.getByRole('heading')).toHaveTextContent('No CPU usage data found');
    expect(screen.getByText(/Upload top output or a supported JFR/)).toBeInTheDocument();
  });

  it('explains missing thread dumps', () => {
    render(<NoThreadDumpsError />);

    expect(screen.getByRole('heading')).toHaveTextContent('No thread dumps found');
    expect(screen.getByText('Upload at least one thread dump to use this view.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'centered');
  });

  it('explains when CPU data cannot be matched to a thread dump', () => {
    render(<NoCpuInfosAndThreadDumpPairError />);

    expect(screen.getByRole('heading')).toHaveTextContent('CPU usage data could not be matched to a thread dump');
    expect(screen.getByText(/captured at the same time/)).toBeInTheDocument();
  });

  it('explains an unknown route', () => {
    render(<PageNotFoundError />);

    expect(screen.getByRole('heading')).toHaveTextContent('Page not found');
    expect(screen.getByText("Oops, you've found a dead link.")).toBeInTheDocument();
  });
});
