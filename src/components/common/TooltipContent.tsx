import React from 'react';
import './SmartTooltip.css';

type TooltipContentProps = {
  children: React.ReactNode | string;
  /* eslint-disable-next-line react/require-default-props */
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  placement = 'bottom',
}) => (
  <div className={`smart-tooltip smart-tooltip--${placement}`}>
    {children}
  </div>
);

export default TooltipContent;
