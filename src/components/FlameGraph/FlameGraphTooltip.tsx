import { createRoot, Root } from 'react-dom/client';
import { ChartNode } from 'd3-flame-graph';
import CursorPopup from '../common/CursorPopup';
import PopupContent from '../common/PopupContent';

const topParent = (node: ChartNode): ChartNode => {
  let result = node;
  while (result.parent) {
    result = result.parent;
  }
  return result;
};

// Custom tooltip implementation for d3-flame-graph - note that we are limited by the package's API :(
export function customTooltip() {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  function tip() {
    // create a container div that will persist
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }

  tip.show = (event: MouseEvent, node: ChartNode) => {
    const x: number = event?.pageX || 0;
    const y: number = event?.pageY || 0;

    const { parsedStackFrame } = node.data;
    const samples = node.value;
    const totalSamples = topParent(node).value;
    const percentage = ((samples / totalSamples) * 100).toFixed(2);

    const tooltipContent = (
      <PopupContent>
        <dl>
          <dt>Samples</dt>
          <dd>
            {samples}
            {' '}
            (
            {percentage}
            %)
          </dd>
          {parsedStackFrame.packageName && (
            <>
              <dt>Package</dt>
              <dd>{parsedStackFrame.packageName}</dd>
            </>
          )}
          {parsedStackFrame.rawClassName && (
            <>
              <dt>Class</dt>
              <dd>{parsedStackFrame.rawClassName}</dd>
            </>
          )}
          {parsedStackFrame.rawMethodName && (
            <>
              <dt>Method</dt>
              <dd>{parsedStackFrame.rawMethodName}</dd>
            </>
          )}
          <dt>Frame</dt>
          <dd>{parsedStackFrame.line}</dd>
        </dl>
      </PopupContent>
    );

    root?.render(
      <div style={{
        position: 'absolute',
        left: x,
        top: y,
      }}
      >
        <CursorPopup key={`${x}-${y}`} content={tooltipContent}>
          &#x200b;
        </CursorPopup>
      </div>,
    );
    return tip;
  };

  tip.hide = () => {
    root?.render(null);
    return tip;
  };

  tip.destroy = () => {
    root?.unmount();
    container?.remove();
  };

  return tip;
}

const tooltip = customTooltip();
export default tooltip;
