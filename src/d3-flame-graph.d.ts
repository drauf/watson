// Local type declarations for d3-flame-graph v5, which no longer ships its own
// types and has no @types package. Only the surface used by this app is declared.
declare module 'd3-flame-graph' {
  export interface StackFrame {
    name: string;
    value: number;
    children: StackFrame[];
    parsedStackFrame: import('./components/FlameGraph/FlameGraphPage').ParsedStackFrame;
    fade: boolean;
  }

  export type ChartNode = {
    data: StackFrame,
    parent: ChartNode | null,
    value: number
  };

  export interface FlameGraph {
    (selection: unknown): void;
    width(value: number): FlameGraph;
    cellHeight(value: number): FlameGraph;
    sort(comparator: (a: StackFrame, b: StackFrame) => number): FlameGraph;
    inverted(value: boolean): FlameGraph;
    minFrameSize(value: number): FlameGraph;
    transitionDuration(value: number): FlameGraph;
    tooltip(value: unknown): FlameGraph;
    setColorMapper(mapper: (node: ChartNode, originalColor: string) => string): FlameGraph;
  }

  export default function flamegraph(): FlameGraph;
}
