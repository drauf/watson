import React from 'react';

type Props = {
  stackTrace: string[];
  linesToConsider: number;
};

const StackTrace: React.FunctionComponent<Props> = ({ stackTrace, linesToConsider }) => {
  const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;

  return (
    <ul className="stacktrace">
      {stack.map((line) => <li>{line}</li>)}
    </ul>
  );
};

export default StackTrace;
