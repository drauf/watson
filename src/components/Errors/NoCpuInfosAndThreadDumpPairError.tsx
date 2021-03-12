import React from 'react';

const NoCpuInfosAndThreadDumpPairError: React.FunctionComponent = () => (
  <main id="error">
    <h4>
      You need to load at least one matching pair of
      {' '}
      <i>thread dumps</i>
      {' '}
      and
      {' '}
      <i>top output</i>
      {' '}
      to see this data.
    </h4>
  </main>
);

export default NoCpuInfosAndThreadDumpPairError;
