import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import { openThreadDetailsPopup } from '../ThreadDetails/useOpenThreadDetails';
import useThreadDetailsWindows from './useThreadDetailsWindows';

vi.mock('../ThreadDetails/useOpenThreadDetails', () => ({
  openThreadDetailsPopup: vi.fn(),
}));

const createThread = (id: number): Thread => new Thread(id, `worker-${id}`);
const createPopup = () => ({
  closed: false,
  close: vi.fn(),
  focus: vi.fn(),
}) as unknown as Window;

describe('useThreadDetailsWindows', () => {
  beforeEach(() => vi.mocked(openThreadDetailsPopup).mockReset());

  it('keeps distinct snapshots open and focuses an already-open snapshot', () => {
    const firstThread = createThread(1);
    const secondThread = createThread(2);
    const firstPopup = createPopup();
    const secondPopup = createPopup();
    vi.mocked(openThreadDetailsPopup)
      .mockReturnValueOnce({ popup: firstPopup, container: document.createElement('div') })
      .mockReturnValueOnce({ popup: secondPopup, container: document.createElement('div') });
    const { result } = renderHook(() => useThreadDetailsWindows());

    act(() => result.current.openThreadDetails(firstThread));
    act(() => result.current.openThreadDetails(secondThread));
    act(() => result.current.openThreadDetails(firstThread));

    expect(result.current.openDetails.map(({ thread }) => thread)).toEqual([firstThread, secondThread]);
    expect(openThreadDetailsPopup).toHaveBeenCalledTimes(2);
    expect(firstPopup.focus).toHaveBeenCalledOnce();
  });

  it('removes a closed snapshot and closes remaining windows on unmount', () => {
    const firstThread = createThread(1);
    const secondThread = createThread(2);
    const firstPopup = createPopup();
    const secondPopup = createPopup();
    vi.mocked(openThreadDetailsPopup)
      .mockReturnValueOnce({ popup: firstPopup, container: document.createElement('div') })
      .mockReturnValueOnce({ popup: secondPopup, container: document.createElement('div') });
    const { result, unmount } = renderHook(() => useThreadDetailsWindows());

    act(() => result.current.openThreadDetails(firstThread));
    act(() => result.current.openThreadDetails(secondThread));
    act(() => result.current.closeThreadDetails(firstThread.uniqueId));
    unmount();

    expect(result.current.openDetails).toEqual([expect.objectContaining({ thread: secondThread })]);
    expect(firstPopup.close).not.toHaveBeenCalled();
    expect(secondPopup.close).toHaveBeenCalledOnce();
  });
});
