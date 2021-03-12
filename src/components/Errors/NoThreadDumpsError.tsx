import React from 'react';

const NoThreadDumpsError: React.FunctionComponent = () => (
  <main id="error">
    <h4>
      You need to load at least one file containing
      {' '}
      <i>thread dumps</i>
      {' '}
      to see this data.
    </h4>
  </main>
);

export default NoThreadDumpsError;
