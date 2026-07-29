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

export default function useOpenThreadDetails(thread: Thread | undefined) {
  const [popup, setPopup] = useState<{ window: Window; container: HTMLElement } | null>(null);

  const close = useCallback(() => {
    if (popup && !popup.window.closed) popup.window.close();
    setPopup(null);
  }, [popup]);

  const open = useCallback((event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!thread) return;

    const newPopup = window.open(
      '',
      '_blank',
      popupFeatures,
    );
    if (!newPopup) return;

    newPopup.document.title = `${Thread.getFormattedTime(thread)} - ${thread.name}`;
    const container = newPopup.document.createElement('div');
    newPopup.document.body.replaceChildren(container);
    setPopup({ window: newPopup, container });
  }, [thread]);

  const WindowComponent = thread && popup ? (
    <ThreadDetailsPopup popup={popup.window} container={popup.container} onClose={close}>
      <ThreadDetailsWindow thread={thread} />
    </ThreadDetailsPopup>
  ) : null;

  return { open, close, WindowComponent };
}
