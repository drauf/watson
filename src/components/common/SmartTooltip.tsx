import React, { useState, useRef, useEffect } from 'react';
import './SmartTooltip.css';

type Props = {
  children: React.ReactNode;
  tooltip: string;
  className?: string;
  disabled?: boolean;
};

const SmartTooltip: React.FC<Props> = ({ children, tooltip, className = '', disabled = false }) => {
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

    let top = containerRect.bottom + 8; // Default: below element
    let left = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2; // Centered
    let placement = 'bottom';

    // Check if tooltip would overflow bottom of viewport
    if (top + tooltipRect.height > viewport.height - 10) {
      top = containerRect.top - tooltipRect.height - 8; // Position above
      placement = 'top';
    }

    // Check if tooltip would overflow right edge
    if (left + tooltipRect.width > viewport.width - 10) {
      left = viewport.width - tooltipRect.width - 10; // Align to right edge
    }

    // Check if tooltip would overflow left edge
    if (left < 10) {
      left = 10; // Align to left edge
    }

    setPosition({ top, left, placement });
  };

  const handleMouseEnter = () => {
    if (disabled || !tooltip.trim()) return;
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered before calculating position
      const timer = setTimeout(calculatePosition, 10);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`smart-tooltip-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && tooltip.trim() && (
        <div
          ref={tooltipRef}
          className={`smart-tooltip smart-tooltip--${position.placement}`}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 1000,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;