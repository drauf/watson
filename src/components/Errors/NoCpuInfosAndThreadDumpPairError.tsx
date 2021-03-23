import React from 'react';

export default class NoCpuInfosAndThreadDumpPairError extends React.PureComponent {
  public render(): JSX.Element {
    return (
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
  }
}
