import { createRoot, Root } from 'react-dom/client';
import { ChartNode } from 'd3-flame-graph';
import SmartTooltip from '../common/SmartTooltip';

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
      <>
        <div>
          {samples}
          {' '}
          samples (
          {percentage}
          %)
        </div>
        {parsedStackFrame.packageName && (
          <div>
            Package:
            {' '}
            {parsedStackFrame.packageName}
          </div>
        )}
        {parsedStackFrame.rawClassName && (
          <div>
            Class:
            {' '}
            {parsedStackFrame.rawClassName}
          </div>
        )}
        {parsedStackFrame.rawMethodName && (
          <div>
            Method:
            {' '}
            {parsedStackFrame.rawMethodName}
          </div>
        )}
        <div>
          {parsedStackFrame.line}
        </div>
      </>
    );

    root?.render(
      <div style={{
        position: 'absolute',
        left: x,
        top: y,
      }}
      >
        <SmartTooltip
          key={`${x}-${y}`}
          tooltip={tooltipContent}
          alwaysVisible
        >
          &#x200b;
        </SmartTooltip>
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
