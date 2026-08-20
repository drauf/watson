import { type JSX } from 'react';
import PopupContent from '../common/PopupContent';
import { FlameGraphNode, flameNodeValue } from './flameGraphModel';

interface Props {
  node: FlameGraphNode;
  totalSamples: number;
}

const FlameGraphPopupContent = ({ node, totalSamples }: Props): JSX.Element => {
  const { parsedStackFrame } = node;
  const samples = flameNodeValue(node);
  const percentage = ((samples / totalSamples) * 100).toFixed(2);

  return (
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
          <dd><code>{parsedStackFrame.packageName}</code></dd>
        </>
        )}
        {parsedStackFrame.rawClassName && (
        <>
          <dt>Class</dt>
          <dd><code>{parsedStackFrame.rawClassName}</code></dd>
        </>
        )}
        {parsedStackFrame.rawMethodName && (
        <>
          <dt>Method</dt>
          <dd><code>{parsedStackFrame.rawMethodName}</code></dd>
        </>
        )}
        <dt>Frame</dt>
        <dd>{parsedStackFrame.line}</dd>
      </dl>
    </PopupContent>
  );
};

export default FlameGraphPopupContent;
