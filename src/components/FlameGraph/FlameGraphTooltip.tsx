import {createRoot, Root} from 'react-dom/client';
import type {Node} from './FlameGraph';
import SmartTooltip from '../common/SmartTooltip';

export const splitFrame = (fullFrame: string): { packageName: string; className: string; methodName: string } => {
  const parts = fullFrame.split('.');
  const methodName = parts.pop() || '';
  const className = parts.pop() || '';
  const packageName = parts.join('.');
  return {packageName, className, methodName};
};

const topParent = (node: Node): Node => {
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

  tip.show = (node: Node) => {
    const x: number = window.event.pageX;
    const y: number = window.event.pageY;

    const { packageName, className, methodName } = splitFrame(node.data.fullFrame);
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
        <div>
          {packageName}
        </div>
        <div>
          {className}
          .
          {methodName}
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

// we need to export as boolean because of a bug in types for d3-flame-graph
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default tooltip as boolean;
