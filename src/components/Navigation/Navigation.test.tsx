import { fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import {
  describe, expect, it, vi,
} from 'vitest';
import { clearCurrentData } from '../../common/threadDumpsStorageService';
import Navigation from './Navigation';

vi.mock('../../common/threadDumpsStorageService', () => ({ clearCurrentData: vi.fn() }));
vi.mock('../ThemeSwitcher/ThemeSwitcher', () => ({ default: () => <div /> }));

const CurrentPath = (): JSX.Element => <output data-testid="current-path">{useLocation().pathname}</output>;

const renderNavigation = () => render(
  <MemoryRouter initialEntries={['/thread-dumps/summary']}>
    <Routes>
      <Route
        path="/:threadDumpsHash/*"
        element={(
          <>
            <Navigation />
            <CurrentPath />
          </>
        )}
      />
      <Route path="/" element={<CurrentPath />} />
    </Routes>
  </MemoryRouter>,
);

describe('Navigation', () => {
  it('clears stored data and returns to the upload page', () => {
    renderNavigation();
    fireEvent.click(screen.getByRole('button', { name: 'Clear data' }));

    expect(clearCurrentData).toHaveBeenCalledOnce();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  });
});
