import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import HoverPopup from './HoverPopup';

interface PopupProps {
  content: () => React.ReactNode;
  isOpen: boolean;
  trigger: (props: { ref: React.Ref<HTMLDivElement> }) => React.ReactNode;
}

vi.mock('@atlaskit/popup', () => ({
  default: ({ content, isOpen, trigger }: PopupProps) => (
    <>
      {trigger({ ref: null })}
      {isOpen && content()}
    </>
  ),
}));

describe('HoverPopup', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const renderPopup = () => {
    render(
      <HoverPopup content="Thread details">
        <button type="button">Trigger</button>
      </HoverPopup>,
    );

    return screen.getByText('Trigger').parentElement as HTMLDivElement;
  };

  it('opens on hover and closes after a short delay', () => {
    const trigger = renderPopup();

    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Thread details')).toBeVisible();

    fireEvent.mouseLeave(trigger);
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByText('Thread details')).toBeVisible();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Thread details')).not.toBeInTheDocument();
  });

  it('keeps the popup open when hover returns before the close delay', () => {
    const trigger = renderPopup();

    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(trigger);
    act(() => vi.advanceTimersByTime(100));

    expect(screen.getByText('Thread details')).toBeVisible();
  });
});
