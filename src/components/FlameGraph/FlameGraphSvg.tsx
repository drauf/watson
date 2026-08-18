import React, { type JSX, useMemo } from 'react';
import getColorForStackLine from '../../common/getColorForStackLine';
import { FLAME_GRAPH_ROW_HEIGHT, FlameGraphFrame, FlameGraphNode } from './flameGraphModel';

interface Props {
  ancestors: FlameGraphNode[];
  containerWidth: number;
  frames: FlameGraphFrame[];
  height: number;
  onAncestorClick: (index: number) => void;
  onFrameClick: (frame: FlameGraphFrame) => void;
  onHover: (node: FlameGraphNode | undefined, id: string | undefined, x: number, y: number) => void;
}

const TEXT_SHIFT_PIXELS = 18;
const LABEL_MINIMUM_PIXELS = 70;

const FlameGraphSvg = ({
  ancestors, containerWidth, frames, height, onAncestorClick, onFrameClick, onHover,
}: Props): JSX.Element => {
  const framesById = useMemo(() => new Map(frames.map((frame) => [frame.id, frame])), [frames]);
  const breadcrumbDepth = ancestors.length;
  const frameWidth = (width: number): string => `${(width + (1 / containerWidth)) * 100}%`;

  const onClick = (event: React.MouseEvent<SVGSVGElement>): void => {
    const target = event.target as Element;
    const frame = framesById.get(target.closest<SVGElement>('[data-flame-frame]')?.dataset['flameFrame'] ?? '');
    if (frame) {
      onFrameClick(frame);
      return;
    }
    const index = target.closest<SVGElement>('[data-flame-ancestor]')?.dataset['flameAncestor'];
    if (index !== undefined) onAncestorClick(Number(index));
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const target = event.target as Element;
    const frameId = target.closest<SVGElement>('[data-flame-frame]')?.dataset['flameFrame'];
    const ancestorIndex = target.closest<SVGElement>('[data-flame-ancestor]')?.dataset['flameAncestor'];
    onHover(
      frameId ? framesById.get(frameId)?.node : ancestors[Number(ancestorIndex)],
      frameId ?? (ancestorIndex === undefined ? undefined : `ancestor-${ancestorIndex}`),
      event.clientX,
      event.clientY,
    );
  };

  return (
    <svg aria-label="Flame graph" height={height} onClick={onClick} onPointerLeave={() => onHover(undefined, undefined, 0, 0)} onPointerMove={onPointerMove} role="img" width="100%">
      {ancestors.map((ancestor, index) => {
        const y = index * FLAME_GRAPH_ROW_HEIGHT;
        const key = ancestors.slice(0, index + 1).map((node) => node.parsedStackFrame.rawFrame).join('>');
        return (
          <g data-flame-ancestor={index} key={key}>
            <rect fill={getColorForStackLine(ancestor.parsedStackFrame.rawFrame, true)} height={FLAME_GRAPH_ROW_HEIGHT} width="100%" x="0" y={y} />
            <text pointerEvents="none" x="4" y={y + TEXT_SHIFT_PIXELS}>{ancestor.name}</text>
          </g>
        );
      })}
      {frames.map((frame) => {
        const background = getColorForStackLine(frame.node.parsedStackFrame.rawFrame, frame.node.fade);
        const y = (breadcrumbDepth + frame.depth) * FLAME_GRAPH_ROW_HEIGHT;
        const showLabel = frame.width * containerWidth >= LABEL_MINIMUM_PIXELS;
        const clipId = `flame-clip-${frame.id}`;
        return (
          <g data-flame-frame={frame.id} key={frame.id}>
            {showLabel && <clipPath id={clipId}><rect height={FLAME_GRAPH_ROW_HEIGHT} width={frameWidth(frame.width)} x={`${frame.x * 100}%`} y={y} /></clipPath>}
            <rect fill={background} height={FLAME_GRAPH_ROW_HEIGHT} width={frameWidth(frame.width)} x={`${frame.x * 100}%`} y={y} />
            {showLabel && <text clipPath={`url(#${clipId})`} dx={4} pointerEvents="none" x={`${frame.x * 100}%`} y={y + TEXT_SHIFT_PIXELS}>{frame.node.name}</text>}
          </g>
        );
      })}
    </svg>
  );
};

export default FlameGraphSvg;
