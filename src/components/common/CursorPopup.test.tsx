import { describe, expect, it } from 'vitest';
import { calculatePopupPosition } from './CursorPopup';

const rectangle = (left: number, top: number, width: number, height: number) => ({
  left,
  right: left + width,
  top,
  bottom: top + height,
  width,
  height,
});

describe('calculatePopupPosition', () => {
  const viewport = { width: 1000, height: 800 };
  const tooltip = rectangle(0, 0, 200, 120);

  it('opens below and to the right when there is room', () => {
    expect(calculatePopupPosition(rectangle(100, 100, 0, 0), tooltip, viewport)).toEqual({
      left: 116,
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
});
