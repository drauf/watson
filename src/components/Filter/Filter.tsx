import Button from '@atlaskit/button/new';
import React from 'react';
import HoverPopup from '../common/HoverPopup';

interface Props {
  name: string;
  displayName: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  tooltip: string;
}

const Filter: React.FC<Props> = ({
  name, displayName, checked, onChange, tooltip,
}) => {
  const handleClick = () => {
    const event = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLInputElement>;
    Object.defineProperty(event, 'target', { value: { checked: !checked, name }, enumerable: true });
    onChange(event);
  };

  const button = (
    <Button
      appearance="default"
      isSelected={checked}
      onClick={handleClick}
      aria-label={displayName}
      aria-pressed={checked}
    >
      {displayName}
    </Button>
  );

  return tooltip ? <HoverPopup content={tooltip}>{button}</HoverPopup> : button;
};

export default Filter;
