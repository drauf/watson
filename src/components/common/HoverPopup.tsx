import Popup, { type TriggerProps } from '@atlaskit/popup';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PopupContent from './PopupContent';

interface Props {
  children: React.ReactNode;
  content: React.ReactNode;
}

const CLOSE_DELAY_MS = 100;

// Atlaskit Popup owns placement; this adapter supplies reusable hover open/close behavior for React triggers.
const HoverPopup: React.FC<Props> = ({ children, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const open = useCallback(() => {
    cancelClose();
    setIsOpen(true);
  }, [cancelClose]);

  const close = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  const renderContent = useCallback(
    () => <PopupContent>{content}</PopupContent>,
    [content],
  );

  const renderTrigger = useCallback(
    ({ ref, ...triggerProps }: TriggerProps) => (
      <div
        {...triggerProps}
        ref={ref}
        onBlur={close}
        onFocus={open}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </div>
    ),
    [children, close, open],
  );

  return (
    <Popup
      autoFocus={false}
      boundary={document.body}
      content={renderContent}
      isOpen={isOpen}
      onClose={close}
      placement="auto-end"
      trigger={renderTrigger}
    />
  );
};

export default HoverPopup;
