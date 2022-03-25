// @ts-expect-error: the library exports this file but does not have types for it
import { defaultFlamegraphTooltip } from 'd3-flame-graph';
import { Node } from './FlameGraph';

const topParent = (node: Node): Node => {
  let result = node;
  while (result.parent) {
    result = result.parent;
  }
  return result;
};

// due to a bug in the lib's type definitions we pretend this function is a boolean
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const tooltip = defaultFlamegraphTooltip()
  .text((node: Node) => {
    const samples = node.value;
    const totalSamples = topParent(node).value;
    const percentage = ((samples / totalSamples) * 100).toFixed(2);

    return `${node.data.name} (${percentage}%, ${samples} samples)`;
  }) as boolean;

export default tooltip;
