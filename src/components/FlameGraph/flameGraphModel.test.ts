import { describe, expect, it } from 'vitest';
import { FlameGraphNode, layoutFlameGraph } from './flameGraphModel';

const node = (name: string, value: number, children: FlameGraphNode[] = []): FlameGraphNode => ({
  name,
  value,
  children,
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

describe('layoutFlameGraph', () => {
  it('lays out sorted child widths proportionally', () => {
    const frames = layoutFlameGraph(node('root', 0, [
      node('small', 1),
      node('large', 3),
    ]), 1000, 5);

    expect(frames.map(({ node: frameNode, x, width }) => ({ name: frameNode.name, x, width }))).toEqual([
      { name: 'root', x: 0, width: 1 },
      { name: 'large', x: 0, width: 0.75 },
      { name: 'small', x: 0.75, width: 0.25 },
    ]);
  });

  it('lays out descendants of a nonzero intermediate node', () => {
    const frames = layoutFlameGraph(node('root', 0, [
      node('thread.run', 2, [node('application.work', 2)]),
    ]), 1000, 5);

    expect(frames.map(({ node: frameNode }) => frameNode.name)).toEqual([
      'root',
      'thread.run',
      'application.work',
    ]);
  });

  it('omits frames narrower than the pixel minimum', () => {
    const frames = layoutFlameGraph(node('root', 0, [
      node('visible', 100),
      node('hidden', 0.1),
    ]), 1000, 5);

    expect(frames.map(({ node: frameNode }) => frameNode.name)).toEqual(['root', 'visible']);
  });
});
