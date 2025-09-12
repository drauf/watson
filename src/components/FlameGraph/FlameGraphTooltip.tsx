// @ts-expect-error: the library exports this file but does not have types for it
import { defaultFlamegraphTooltip } from 'd3-flame-graph';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Node } from './FlameGraph';
import TooltipContent from '../common/TooltipContent';

const topParent = (node: Node): Node => {
  let result = node;
  while (result.parent) {
    result = result.parent;
  }
  return result;
};

// we can't use types from the library because they thing this tooltip is a boolean
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
const tooltip = defaultFlamegraphTooltip()
  .html((node: Node) => {
    const parts = node.data.fullFrame.split('.');

    const samples = node.value;
    const totalSamples = topParent(node).value;
    const percentage = ((samples / totalSamples) * 100).toFixed(2);

    return renderToStaticMarkup(
      <TooltipContent>
        <div>
          {samples}
          {' '}
          samples (
          {percentage}
          %)
        </div>
        <div>
          {parts.slice(0, -2).join('.')}
        </div>
        <div>
          {parts[parts.length - 2]}
          .
          {parts[parts.length - 1]}
        </div>
      </TooltipContent>,
    );
  });

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
tooltip.contentIsHTML = true;

export default tooltip as boolean;
