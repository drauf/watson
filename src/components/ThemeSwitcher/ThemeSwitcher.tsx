import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher" data-testid="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
        className="theme-select"
        data-testid="theme-select"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
