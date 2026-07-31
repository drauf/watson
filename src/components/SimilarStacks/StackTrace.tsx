import React, { type JSX } from 'react';

interface Props {
  stackTrace: string[];
  linesToConsider: number;
}

export default class StackTrace extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { stackTrace, linesToConsider } = this.props;
    const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;
    const lineOccurrences = new Map<string, number>();

    return (
      <p className="stacktrace-container">
        {stack.map((line) => {
          const occurrence = lineOccurrences.get(line) ?? 0;
          lineOccurrences.set(line, occurrence + 1);
          return <code key={`${line}:${occurrence}`}>{line}</code>;
        })}
      </p>
    );
  }
}
