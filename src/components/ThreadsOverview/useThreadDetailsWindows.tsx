import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Thread from '../../types/Thread';
import {
  openThreadDetailsPopup,
  type ThreadDetailsPopupWindow,
} from '../ThreadDetails/useOpenThreadDetails';

export interface OpenThreadDetails extends ThreadDetailsPopupWindow {
  thread: Thread;
}

const useThreadDetailsWindows = () => {
  const isUnmountingRef = useRef(false);
  const openDetailsRef = useRef(new Map<number, OpenThreadDetails>());
  const [openDetails, setOpenDetails] = useState<OpenThreadDetails[]>([]);

  const refresh = useCallback(() => {
    if (!isUnmountingRef.current) setOpenDetails(Array.from(openDetailsRef.current.values()));
  }, []);
  const closeThreadDetails = useCallback((uniqueId: number) => {
    openDetailsRef.current.delete(uniqueId);
    refresh();
  }, [refresh]);
  const openThreadDetails = useCallback((thread: Thread) => {
    const existing = openDetailsRef.current.get(thread.uniqueId);
    if (existing && !existing.popup.closed) {
      existing.popup.focus();
      return;
    }

    const popup = openThreadDetailsPopup(thread);
    if (!popup) return;

    openDetailsRef.current.set(thread.uniqueId, { thread, ...popup });
    refresh();
  }, [refresh]);

  useEffect(() => () => {
    isUnmountingRef.current = true;
    openDetailsRef.current.forEach(({ popup }) => {
      if (!popup.closed) popup.close();
    });
    openDetailsRef.current.clear();
  }, []);

  return {
    closeThreadDetails,
    openDetails,
    openThreadDetails,
  };
};

export default useThreadDetailsWindows;
