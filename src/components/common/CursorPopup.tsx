import React, { useLayoutEffect, useRef, useState } from 'react';

const TOOLTIP_SPACING = 16;
const VIEWPORT_MARGIN = 8;

interface Props {
  children: React.ReactNode;
  content: React.ReactNode;
}

interface PopupPosition {
  top: number;
  left: number;
}

type Rectangle = Pick<DOMRect, 'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'>;

interface Viewport {
  height: number;
  width: number;
}

export const calculatePopupPosition = (
  trigger: Rectangle,
  tooltip: Rectangle,
  viewport: Viewport,
): PopupPosition => {
  const preferredTop = trigger.bottom + tooltip.height > viewport.height - VIEWPORT_MARGIN
    ? trigger.top - tooltip.height - TOOLTIP_SPACING
    : trigger.bottom + TOOLTIP_SPACING;
  const maximumTop = Math.max(VIEWPORT_MARGIN, viewport.height - tooltip.height - VIEWPORT_MARGIN);
  const maximumLeft = Math.max(VIEWPORT_MARGIN, viewport.width - tooltip.width - VIEWPORT_MARGIN);
  const preferredLeft = trigger.right + TOOLTIP_SPACING + tooltip.width <= viewport.width - VIEWPORT_MARGIN
    ? trigger.right + TOOLTIP_SPACING
    : trigger.left - tooltip.width - TOOLTIP_SPACING;

  return {
    top: Math.min(Math.max(VIEWPORT_MARGIN, preferredTop), maximumTop),
    left: Math.min(Math.max(VIEWPORT_MARGIN, preferredLeft), maximumLeft),
  };
};

// D3 supplies a cursor coordinate rather than a React trigger, so this measures and positions its Popup surface.
const CursorPopup: React.FC<Props> = ({ children, content }) => {
  const [position, setPosition] = useState<PopupPosition>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!triggerRef.current || !contentRef.current) {
      return;
    }

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = contentRef.current.getBoundingClientRect();
    setPosition(calculatePopupPosition(trigger, tooltip, {
      height: window.innerHeight,
      width: window.innerWidth,
    }));
  }, []);

  return (
    <div ref={triggerRef}>
      {children}
      <div
        ref={contentRef}
        className="cursor-popup"
        style={{
          position: 'fixed',
          top: position?.top || 0,
          left: position?.left || 0,
          visibility: position ? 'visible' : 'hidden',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default CursorPopup;
