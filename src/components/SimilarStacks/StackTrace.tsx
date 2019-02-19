import React from 'react';

type StackTraceProps = {
  stackTrace: string[];
  linesToConsider: number;
};

const StackTrace: React.SFC<StackTraceProps> = ({ stackTrace, linesToConsider }) => {
  const stack = linesToConsider > 0 ? stackTrace.slice(0, linesToConsider) : stackTrace;

  return (
    <ol className="monospaced">
      {stack.map((line, index) => (
        <li key={index}>{line}</li>))}
    </ol>
  );
};

export default StackTrace;
