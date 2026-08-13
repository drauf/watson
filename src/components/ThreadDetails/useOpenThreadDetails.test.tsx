import { act, renderHook } from '@testing-library/react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import Thread from '../../types/Thread';
import useOpenThreadDetails, { openThreadDetailsPopup } from './useOpenThreadDetails';

describe('openThreadDetailsPopup', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns null when the browser blocks the popup', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);

    expect(openThreadDetailsPopup(new Thread(1, 'worker'))).toBeNull();
  });

  it('initializes the popup document for the requested thread', () => {
    const popupDocument = document.implementation.createHTMLDocument('previous title');
    popupDocument.body.append('previous content');
    const popup = { document: popupDocument } as Window;
    const open = vi.spyOn(window, 'open').mockReturnValue(popup);
    const thread = new Thread(1, 'worker', Date.UTC(2026, 0, 1, 10, 0, 0));

    const result = openThreadDetailsPopup(thread);

    expect(open).toHaveBeenCalledWith('', '_blank', expect.stringContaining('width=960'));
    expect(open).toHaveBeenCalledWith('', '_blank', expect.stringContaining('height=700'));
    expect(popupDocument.title).toBe('10:00:00 - worker');
    expect(popupDocument.body.children).toHaveLength(1);
    expect(result?.popup).toBe(popup);
    expect(result?.container).toBe(popupDocument.body.firstElementChild);
  });
});

describe('useOpenThreadDetails', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not open a popup without a thread but still consumes the event', () => {
    const open = vi.spyOn(window, 'open');
    const { result } = renderHook(() => useOpenThreadDetails(undefined));
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.MouseEvent;

    act(() => result.current.open(event));

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
    expect(result.current.WindowComponent).toBeNull();
  });

  it('clears an already closed popup without closing it again', () => {
    const popupDocument = document.implementation.createHTMLDocument();
    const closePopup = vi.fn();
    const popup = { closed: true, close: closePopup, document: popupDocument } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { result } = renderHook(() => useOpenThreadDetails(new Thread(1, 'worker')));

    act(() => result.current.open());
    expect(result.current.WindowComponent).not.toBeNull();

    act(() => result.current.close());

    expect(closePopup).not.toHaveBeenCalled();
    expect(result.current.WindowComponent).toBeNull();
  });

  it('renders and closes the popup window component', () => {
    const popupDocument = document.implementation.createHTMLDocument();
    const closePopup = vi.fn();
    const popup = { closed: false, close: closePopup, document: popupDocument } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(popup);
    const { result } = renderHook(() => useOpenThreadDetails(new Thread(1, 'worker')));

    act(() => result.current.open());

    expect(result.current.WindowComponent).not.toBeNull();

    act(() => result.current.close());

    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(result.current.WindowComponent).toBeNull();
  });
});
