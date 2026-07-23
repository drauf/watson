import React from 'react';

interface Props {
  stackTrace: string[];
  linesToConsider: number;
}

export default class StackTrace extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { stackTrace, linesToConsider } = this.props;
    const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;

    return (
      <p className="stacktrace-container">
        {stack.map((line) => <code>{line}</code>)}
      </p>
    );
  }
}
