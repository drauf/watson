// @ts-expect-error: the library exports this file but does not have types for it
import { defaultFlamegraphTooltip } from 'd3-flame-graph';

// not actually a boolean but a function, it's a bug in lib's type definitions
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const tooltip = defaultFlamegraphTooltip() as boolean;

export default tooltip;
