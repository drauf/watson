import React from 'react';
import './SmartTooltip.css';

type TooltipContentProps = {
  children: React.ReactNode | string;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  className = '',
  placement = 'bottom'
}) => {
  return (
    <div className={`smart-tooltip smart-tooltip--${placement} ${className}`}>
      {children}
    </div>
  );
};

export default TooltipContent;
