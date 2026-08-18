import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FlameGraph from './FlameGraph';
import { FlameGraphNode } from './flameGraphModel';

const node = (name: string, value: number, children: FlameGraphNode[] = []): FlameGraphNode => ({
  name,
  value,
  children,
  fade: false,
  parsedStackFrame: {
    rawFrame: name,
    rawClassName: name,
    cleanClassName: name,
    rawMethodName: name,
    cleanMethodName: name,
    packageName: '',
    line: '',
  },
});

describe('FlameGraph', () => {
  it('shows detailed popup content for a hovered frame', () => {
    render(<FlameGraph chartData={node('root', 0, [node('target', 2)])} />);

    const targetFrame = document.querySelector('[data-flame-frame="root.0"]');
    if (!targetFrame) {
      throw new Error('Target flame frame was not rendered');
    }
    fireEvent.pointerMove(targetFrame, { clientX: 100, clientY: 100 });

    expect(screen.getByText('Samples')).toBeVisible();
    expect(screen.getByText('2 (100.00%)')).toBeVisible();
  });

  it('rebases popup percentages to the zoomed frame', () => {
    render(<FlameGraph chartData={node('root', 0, [node('target', 2), node('sibling', 4)])} />);

    const targetFrame = [...document.querySelectorAll<SVGGElement>('[data-flame-frame]')]
      .find((frame) => frame.textContent?.includes('target'));
    if (!targetFrame) {
      throw new Error('Target flame frame was not rendered');
    }
    fireEvent.click(targetFrame);
    const zoomRoot = document.querySelector('[data-flame-frame="root"]');
    if (!zoomRoot) {
      throw new Error('Zoom root was not rendered');
    }
    fireEvent.pointerMove(zoomRoot, { clientX: 100, clientY: 100 });

    expect(screen.getByText('2 (100.00%)')).toBeVisible();
  });

  it('hides the popup after leaving the flame graph', () => {
    render(<FlameGraph chartData={node('root', 0, [node('target', 2)])} />);

    const flameGraph = screen.getByRole('img', { name: 'Flame graph' });
    const targetFrame = document.querySelector('[data-flame-frame="root.0"]');
    if (!targetFrame) {
      throw new Error('Target flame frame was not rendered');
    }
    fireEvent.pointerMove(targetFrame, { clientX: 100, clientY: 100 });
    expect(screen.getByText('Samples')).toBeVisible();

    fireEvent.pointerLeave(flameGraph);

    expect(screen.queryByText('Samples')).not.toBeInTheDocument();
  });

  it('creates clip paths only for frames with visible labels', () => {
    render(<FlameGraph chartData={node('root', 0, [node('wide', 100), node('narrow', 0.1)])} />);

    expect(document.querySelectorAll('#flame-graph clipPath')).toHaveLength(2);
  });

  it('zooms into a clicked frame and resets to the root', () => {
    render(<FlameGraph chartData={node('root', 0, [node('target', 2, [node('leaf', 1)])])} />);

    const targetFrame = document.querySelector('[data-flame-frame="root.0"]');
    if (!targetFrame) {
      throw new Error('Target flame frame was not rendered');
    }
    fireEvent.click(targetFrame);

    const ancestor = document.querySelector('[data-flame-ancestor="0"]');
    expect(ancestor).toBeVisible();
    expect(document.querySelectorAll('#flame-graph > svg > g[data-flame-frame] > rect, #flame-graph > svg > g[data-flame-ancestor] > rect')).toHaveLength(3);

    if (!ancestor) {
      throw new Error('Root breadcrumb was not rendered');
    }
    fireEvent.click(ancestor);

    expect(document.querySelector('[data-flame-ancestor]')).not.toBeInTheDocument();
    expect(document.querySelectorAll('#flame-graph > svg > g[data-flame-frame] > rect, #flame-graph > svg > g[data-flame-ancestor] > rect')).toHaveLength(3);
  });
});
