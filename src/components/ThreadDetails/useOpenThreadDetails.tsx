import React, { useCallback, useState } from 'react';
import './ThreadDetailsWindow.css';
import NewWindow from 'react-new-window';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from './ThreadDetailsWindow';

export const THREAD_DETAILS_WINDOW_WIDTH = 960;
export const THREAD_DETAILS_WINDOW_HEIGHT = 700;

const popupFontSources = [
  ['Atlassian Sans', 'link[href*="AtlassianSans-latin.woff2"]'],
  ['Atlassian Mono', 'link[href*="AtlassianMono-latin.woff2"]'],
] as const;

const loadPopupFonts = (window: Window) => {
  popupFontSources.forEach(([family, selector]) => {
    const source = document.head.querySelector<HTMLLinkElement>(selector);
    if (!source) return;

    new FontFace(family, `url("${source.href}")`)
      .load()
      .then((font) => window.document.fonts.add(font))
      .catch(() => undefined);
  });
};

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
    loadPopupFonts(window);
  }, []);

  const WindowComponent = thread && isOpen ? (
    <NewWindow
      title={`${Thread.getFormattedTime(thread)} - ${thread.name}`}
      onUnload={close}
      onOpen={onOpen}
      features={{
        width: THREAD_DETAILS_WINDOW_WIDTH,
        height: THREAD_DETAILS_WINDOW_HEIGHT,
        titlebar: 0,
        menubar: 0,
        location: 0,
        toolbar: 0,
        status: 0,
      }}
    >
      <ThreadDetailsWindow thread={thread} />
    </NewWindow>
  ) : null;

  return { open, close, WindowComponent };
}
