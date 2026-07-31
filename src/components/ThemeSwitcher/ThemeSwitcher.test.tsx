import { fireEvent, render, screen } from '@testing-library/react';
import { useSetColorMode } from '@atlaskit/app-provider';
import {
  describe, expect, it, vi,
} from 'vitest';
import ThemeSwitcher from './ThemeSwitcher';

vi.mock('@atlaskit/app-provider', () => ({ useSetColorMode: vi.fn() }));

const mockedUseSetColorMode = vi.mocked(useSetColorMode);

describe('ThemeSwitcher', () => {
  it('opens theme choices and applies the selected color mode', () => {
    const setColorMode = vi.fn();
    mockedUseSetColorMode.mockReturnValue(setColorMode);

    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByTestId('theme-picker--trigger'));
    fireEvent.click(screen.getByText('Dark', { exact: true }));

    expect(setColorMode).toHaveBeenCalledWith('dark');
  });
});
