import React, { ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  popup: Window;
  container: HTMLElement;
  onClose: () => void;
  children: ReactNode;
}

const copyPopupStyles = (popup: Window) => {
  popup.document.head.querySelectorAll('[data-thread-details-popup-style]')
    .forEach((node) => node.remove());

  document.head.querySelectorAll('style, link[rel~="stylesheet"], link[rel~="preload"][as="font"]')
    .forEach((node) => {
      const copied = node.cloneNode(true) as HTMLElement;
      copied.setAttribute('data-thread-details-popup-style', '');
      popup.document.head.append(copied);
    });
};

const copyPopupTheme = (popup: Window) => {
  const source = document.documentElement;
  const target = popup.document.documentElement;

  target.className = source.className;
  ['data-color-mode', 'data-theme'].forEach((attribute) => {
    const value = source.getAttribute(attribute);
    if (value) target.setAttribute(attribute, value);
    else target.removeAttribute(attribute);
  });
};

const ThreadDetailsPopup: React.FC<Props> = ({
  popup, container, onClose, children,
}) => {
  useLayoutEffect(() => {
    if (popup.closed) {
      onClose();
      return undefined;
    }

    const synchronize = () => {
      copyPopupTheme(popup);
      copyPopupStyles(popup);
    };

    synchronize();
    const headObserver = new MutationObserver(synchronize);
    const themeObserver = new MutationObserver(synchronize);
    headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-color-mode', 'data-theme'] });
    popup.addEventListener('beforeunload', onClose);

    return () => {
      headObserver.disconnect();
      themeObserver.disconnect();
      popup.removeEventListener('beforeunload', onClose);
    };
  }, [onClose, popup]);

  return container ? (createPortal(children, container)) : null;
};

export default ThreadDetailsPopup;
