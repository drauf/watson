import React, { useCallback, useState } from 'react';
import './ThreadDetailsWindow.css';
import Thread from '../../types/Thread';
import ThreadDetailsPopup from './ThreadDetailsPopup';
import ThreadDetailsWindow from './ThreadDetailsWindow';

export const THREAD_DETAILS_WINDOW_WIDTH = 960;
export const THREAD_DETAILS_WINDOW_HEIGHT = 700;

const popupFeatures = [
  `width=${THREAD_DETAILS_WINDOW_WIDTH}`,
  `height=${THREAD_DETAILS_WINDOW_HEIGHT}`,
  'titlebar=no',
  'menubar=no',
  'location=no',
  'toolbar=no',
  'status=no',
].join(',');

export interface ThreadDetailsPopupWindow {
  popup: Window;
  container: HTMLElement;
}

export const openThreadDetailsPopup = (thread: Thread): ThreadDetailsPopupWindow | null => {
  const popup = window.open('', '_blank', popupFeatures);
  if (!popup) return null;

  popup.document.title = `${Thread.getFormattedTime(thread)} - ${thread.name}`;
  const container = popup.document.createElement('div');
  popup.document.body.replaceChildren(container);
  return { popup, container };
};

export default function useOpenThreadDetails(thread: Thread | undefined) {
  const [popup, setPopup] = useState<ThreadDetailsPopupWindow | null>(null);

  const close = useCallback(() => {
    if (popup && !popup.popup.closed) popup.popup.close();
    setPopup(null);
  }, [popup]);

  const open = useCallback((event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!thread) return;

    setPopup(openThreadDetailsPopup(thread));
  }, [thread]);

  const WindowComponent = thread && popup ? (
    <ThreadDetailsPopup popup={popup.popup} container={popup.container} onClose={close}>
      <ThreadDetailsWindow thread={thread} />
    </ThreadDetailsPopup>
  ) : null;

  return { open, close, WindowComponent };
}
