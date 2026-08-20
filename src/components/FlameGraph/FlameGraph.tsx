import { type JSX, useMemo, useState } from 'react';
import CursorPopup from '../common/CursorPopup';
import FlameGraphPopupContent from './FlameGraphPopupContent';
import FlameGraphSvg from './FlameGraphSvg';
import {
  FlameGraphFrame, FlameGraphNode, FLAME_GRAPH_ROW_HEIGHT, flameNodeValue, layoutFlameGraph, maxFrameDepth,
} from './flameGraphModel';

interface Props { chartData: FlameGraphNode }
interface Zoom { chartData: FlameGraphNode; root: FlameGraphNode; ancestors: FlameGraphNode[] }
interface HoveredFrame { id: string; node: FlameGraphNode; x: number; y: number }

const MINIMUM_FRAME_PIXELS = 5;

const FlameGraph = ({ chartData }: Props): JSX.Element => {
  const [zoom, setZoom] = useState<Zoom>({ chartData, root: chartData, ancestors: [] });
  const [hoveredFrame, setHoveredFrame] = useState<HoveredFrame>();
  const activeZoom = zoom.chartData === chartData ? zoom : { chartData, root: chartData, ancestors: [] };
  const containerWidth = Math.max(window.innerWidth, 1);
  const frames = useMemo(() => (
    layoutFlameGraph(activeZoom.root, containerWidth, MINIMUM_FRAME_PIXELS)
      .map((frame) => ({
        ...frame,
        isZoomPath: activeZoom.ancestors.length > 0 && frame.node === activeZoom.root,
      }))
  ), [activeZoom.ancestors.length, activeZoom.root, containerWidth]);
  const height = (activeZoom.ancestors.length + maxFrameDepth(frames) + 1) * FLAME_GRAPH_ROW_HEIGHT;
  const totalSamples = useMemo(() => flameNodeValue(activeZoom.root), [activeZoom.root]);

  const zoomToFrame = (frame: FlameGraphFrame): void => {
    const localAncestors: FlameGraphNode[] = [];
    const frameMap = new Map(frames.map((current) => [current.id, current]));
    const path = frame.id.split('.');
    for (let length = 1; length < path.length; length += 1) {
      const ancestor = frameMap.get(path.slice(0, length).join('.'));
      if (ancestor) localAncestors.push(ancestor.node);
    }
    setHoveredFrame(undefined);
    setZoom({ chartData, root: frame.node, ancestors: [...activeZoom.ancestors, ...localAncestors] });
  };

  const zoomToAncestor = (index: number): void => {
    const root = activeZoom.ancestors[index];
    if (root) {
      setHoveredFrame(undefined);
      setZoom({ chartData, root, ancestors: activeZoom.ancestors.slice(0, index) });
    }
  };

  const updateHover = (node: FlameGraphNode | undefined, id: string | undefined, x: number, y: number): void => {
    if (!node || !id) {
      setHoveredFrame(undefined);
      return;
    }
    setHoveredFrame((current) => (current?.id === id ? current : {
      id, node, x, y,
    }));
  };

  return (
    <section id="flame-graph">
      <FlameGraphSvg
        ancestors={activeZoom.ancestors}
        containerWidth={containerWidth}
        frames={frames}
        height={height}
        onAncestorClick={zoomToAncestor}
        onFrameClick={zoomToFrame}
        onHover={updateHover}
      />
      {hoveredFrame && (
        <div style={{ left: hoveredFrame.x, position: 'fixed', top: hoveredFrame.y }}>
          <CursorPopup key={hoveredFrame.id} content={<FlameGraphPopupContent node={hoveredFrame.node} totalSamples={totalSamples} />}>&#x200b;</CursorPopup>
        </div>
      )}
    </section>
  );
};

export default FlameGraph;
