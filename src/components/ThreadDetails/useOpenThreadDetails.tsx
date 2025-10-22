import React, { useCallback, useState } from 'react';
import './ThreadDetailsWindow.css';
import NewWindow from 'react-new-window';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from './ThreadDetailsWindow';

export default function useOpenThreadDetails(thread: Thread | undefined) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOpen = useCallback((window: Window) => {
    // Copy CSS custom properties from :root
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = Array.from(rootStyles).filter((prop) => prop.startsWith('--'));
    cssVars.forEach((varName) => {
      const value = rootStyles.getPropertyValue(varName);
      window.document.documentElement.style.setProperty(varName, value);
    });
  }, []);

  const WindowComponent = thread && isOpen ? (
    <NewWindow
      title={`${Thread.getFormattedTime(thread)} - ${thread.name}`}
      onUnload={close}
      onOpen={onOpen}
      features={{
        width: 960, height: 700, titlebar: 0, menubar: 0, location: 0, toolbar: 0, status: 0,
      }}
    >
      <ThreadDetailsWindow thread={thread} />
    </NewWindow>
  ) : null;

  return { open, close, WindowComponent };
}
