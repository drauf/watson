import React from 'react';

interface Props {
  // This component doesn't receive any props
}

export default class NoCpuInfosAndThreadDumpPairError extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    return (
      <main id="centered">
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
