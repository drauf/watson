import React from 'react';

const NoCpuInfosError: React.FunctionComponent = () => (
  <main id="error">
    <h4>
      You need to load at least one file containing
      {' '}
      <i>top output</i>
      {' '}
      to see this data.
    </h4>
  </main>
);

export default NoCpuInfosError;
