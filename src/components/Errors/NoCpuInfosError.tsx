import React from 'react';

interface Props {
  // This component doesn't receive any props
}

export default class NoCpuInfosError extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    return (
      <main id="centered">
        <h4>
          You need to load at least one file containing
          {' '}
          <i>top output</i>
          {' '}
          to see this data.
        </h4>
      </main>
    );
  }
}
