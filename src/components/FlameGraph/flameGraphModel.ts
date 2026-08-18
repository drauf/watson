import type { ParsedStackFrame } from './FlameGraphPage';

export const FLAME_GRAPH_ROW_HEIGHT = 26;

export interface FlameGraphNode {
  name: string;
  value: number;
  children: FlameGraphNode[];
  fade: boolean;
  parsedStackFrame: ParsedStackFrame;
}

export interface FlameGraphFrame {
  id: string;
  node: FlameGraphNode;
  depth: number;
  x: number;
  width: number;
}

export const flameNodeValue = (node: FlameGraphNode): number => (
  node.value || node.children.reduce((total, child) => total + flameNodeValue(child), 0)
);

const collectNodeValues = (node: FlameGraphNode, values: Map<FlameGraphNode, number>): number => {
  const childTotal = node.children.reduce((total, child) => total + collectNodeValues(child, values), 0);
  const value = node.value || childTotal;
  values.set(node, value);
  return value;
};

const appendFrames = (
  node: FlameGraphNode,
  id: string,
  depth: number,
  x: number,
  width: number,
  minimumWidth: number,
  values: Map<FlameGraphNode, number>,
  frames: FlameGraphFrame[],
): void => {
  if (width < minimumWidth) {
    return;
  }

  frames.push({
    id, node, depth, x, width,
  });
  const children = [...node.children].sort((left, right) => (values.get(right) ?? 0) - (values.get(left) ?? 0));
  const total = values.get(node) ?? 0;
  let childX = x;
  for (const [index, child] of children.entries()) {
    const childWidth = total === 0 ? 0 : width * ((values.get(child) ?? 0) / total);
    appendFrames(child, `${id}.${index}`, depth + 1, childX, childWidth, minimumWidth, values, frames);
    childX += childWidth;
  }
};

export const layoutFlameGraph = (
  root: FlameGraphNode,
  containerWidth: number,
  minimumFramePixels: number,
): FlameGraphFrame[] => {
  const values = new Map<FlameGraphNode, number>();
  collectNodeValues(root, values);
  const frames: FlameGraphFrame[] = [];
  appendFrames(root, 'root', 0, 0, 1, minimumFramePixels / containerWidth, values, frames);
  return frames;
};

export const maxFrameDepth = (frames: FlameGraphFrame[]): number => (
  frames.reduce((maximum, frame) => Math.max(maximum, frame.depth), 0)
);
