import { useSetColorMode } from '@atlaskit/app-provider';
import Button from '@atlaskit/button/new';
import DropdownMenu, {
  DropdownItem, DropdownItemGroup, type CustomTriggerProps,
} from '@atlaskit/dropdown-menu';
import ThemeIcon from '@atlaskit/icon/core/theme';
import React from 'react';

type ThemePreference = 'light' | 'dark' | 'auto';

const ThemeButtonIcon = () => <ThemeIcon label="" />;

const renderThemeTrigger = ({
  isSelected, triggerRef, ...triggerProps
}: CustomTriggerProps<HTMLButtonElement>) => (
  <Button
    {...triggerProps}
    ref={triggerRef}
    appearance="default"
    isSelected={isSelected ?? false}
    iconBefore={ThemeButtonIcon}
  >
    Theme
  </Button>
);

const ThemeSwitcher: React.FC = () => {
  const setColorMode = useSetColorMode();

  const handleThemeChange = (mode: ThemePreference) => {
    setColorMode(mode);
  };

  return (
    <div className="theme-switcher" data-testid="theme-switcher">
      <DropdownMenu
        trigger={renderThemeTrigger}
        testId="theme-picker"
        placement="bottom-end"
      >
        <DropdownItemGroup>
          <DropdownItem onClick={() => handleThemeChange('light')}>Light</DropdownItem>
          <DropdownItem onClick={() => handleThemeChange('dark')}>Dark</DropdownItem>
          <DropdownItem onClick={() => handleThemeChange('auto')}>Match system</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSwitcher;
