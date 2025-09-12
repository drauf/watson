import React, { useState, useRef, useEffect } from 'react';
import TooltipContent from './TooltipContent';
import './SmartTooltip.css';

const TOOLTIP_SPACING = 16;
const VIEWPORT_MARGIN = 8;

type Props = {
  children: React.ReactNode;
  tooltip: string | React.ReactNode;
  alwaysVisible: boolean | undefined;
};

const SmartTooltip: React.FC<Props> = ({
  children, tooltip, alwaysVisible,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = containerRect.bottom + TOOLTIP_SPACING; // Default: below element
    let left = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2; // Centered
    let placement = 'bottom';

    // Check if tooltip would overflow bottom of viewport
    if (top + tooltipRect.height > viewport.height - VIEWPORT_MARGIN) {
      top = containerRect.top - tooltipRect.height - TOOLTIP_SPACING; // Position above
      placement = 'top';
    }

    // Check if tooltip would overflow right edge
    if (left + tooltipRect.width > viewport.width - VIEWPORT_MARGIN) {
      left = viewport.width - tooltipRect.width - TOOLTIP_SPACING; // Align to right edge
    }

    // Check if tooltip would overflow left edge
    if (left < VIEWPORT_MARGIN) {
      left = TOOLTIP_SPACING; // Align to left edge
    }

    setPosition({ top, left, placement });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (alwaysVisible || isVisible) {
      // Small delay to ensure tooltip is rendered before calculating position
      const timer = setTimeout(calculatePosition, 10);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [alwaysVisible, isVisible]);

  return (
    <div
      ref={containerRef}
      className="smart-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {(alwaysVisible || isVisible) && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 1000,
          }}
        >
          <TooltipContent placement={position.placement as 'top' | 'bottom'}>
            {tooltip}
          </TooltipContent>
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;
