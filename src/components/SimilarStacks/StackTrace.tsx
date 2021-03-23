import React from 'react';

type Props = {
  stackTrace: string[];
  linesToConsider: number;
};

export default class StackTrace extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { stackTrace, linesToConsider } = this.props;
    const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;

    return (
      <ul className="stacktrace">
        {stack.map((line) => <li>{line}</li>)}
      </ul>
    );
  }
}
