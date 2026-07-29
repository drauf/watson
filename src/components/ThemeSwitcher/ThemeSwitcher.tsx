import { useColorMode, useSetColorMode } from '@atlaskit/app-provider';
import React, { useState } from 'react';
import './ThemeSwitcher.css';

type ThemePreference = 'light' | 'dark' | 'auto';

const ThemeSwitcher: React.FC = () => {
  const colorMode = useColorMode();
  const setColorMode = useSetColorMode();
  const [selectedMode, setSelectedMode] = useState<ThemePreference>('auto');

  const onThemeChange = (nextMode: ThemePreference) => {
    setSelectedMode(nextMode);
    setColorMode(nextMode);
  };

  return (
    <div className="theme-switcher" data-testid="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Theme
      </label>
      <select
        id="theme-select"
        value={selectedMode}
        onChange={(event) => onThemeChange(event.target.value as ThemePreference)}
        className="theme-select"
        data-testid="theme-select"
        aria-label={`Theme, currently ${colorMode}`}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Match system</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
