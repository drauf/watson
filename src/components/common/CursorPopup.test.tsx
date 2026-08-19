import { render, screen } from '@testing-library/react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import CursorPopup, { calculatePopupPosition } from './CursorPopup';

const rectangle = (left: number, top: number, width: number, height: number) => ({
  left,
  right: left + width,
  top,
  bottom: top + height,
  width,
  height,
});

describe('calculatePopupPosition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const viewport = { width: 1000, height: 800 };
  const tooltip = rectangle(0, 0, 200, 120);

  it('opens below and to the right when there is room', () => {
    expect(calculatePopupPosition(rectangle(100, 100, 0, 0), tooltip, viewport)).toEqual({
      left: 116,
      top: 116,
    });
  });

  it('rounds fractional trigger coordinates to whole CSS pixels', () => {
    expect(calculatePopupPosition(rectangle(95.859375, 100.4, 0, 0), tooltip, viewport)).toEqual({
      left: 112,
      top: 116,
    });
  });

  it('opens fully to the left near the right viewport edge', () => {
    expect(calculatePopupPosition(rectangle(950, 100, 0, 0), tooltip, viewport)).toEqual({
      left: 734,
      top: 116,
    });
  });

  it('opens above the cursor near the bottom viewport edge', () => {
    expect(calculatePopupPosition(rectangle(100, 750, 0, 0), tooltip, viewport)).toEqual({
      left: 116,
      top: 614,
    });
  });

  it('clamps an oversized tooltip within viewport margins', () => {
    expect(calculatePopupPosition(
      rectangle(500, 400, 0, 0),
      rectangle(0, 0, 1200, 900),
      viewport,
    )).toEqual({ left: 8, top: 8 });
  });

  it('measures its surfaces and makes the popup visible', () => {
    const getBoundingClientRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValueOnce(rectangle(100, 100, 0, 0) as DOMRect)
      .mockReturnValueOnce(rectangle(0, 0, 200, 120) as DOMRect);

    render(
      <CursorPopup content="Thread details">
        <button type="button">Trigger</button>
      </CursorPopup>,
    );

    const popup = screen.getByText('Thread details');
    expect(popup).toHaveStyle({ left: '116px', top: '116px', visibility: 'visible' });
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
  });
});
