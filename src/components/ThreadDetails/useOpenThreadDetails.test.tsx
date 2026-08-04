import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import Thread from '../../types/Thread';
import { openThreadDetailsPopup } from './useOpenThreadDetails';

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
