import React from 'react';

type Props = {
  stackTrace: string[];
  linesToConsider: number;
};

const StackTrace: React.SFC<Props> = ({ stackTrace, linesToConsider }) => {
  const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;

  return (
    <ol className="stacktrace">
      {stack.map((line, index) => (
        <li key={index}>{line}</li>))}
    </ol>
  );
};

export default StackTrace;
