import React from 'react';

interface Props {
  // This component doesn't receive any props
}

export default class NoCpuConsumersJfrDataError extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    return (
      <main id="centered">
        <h4>
          You need to load
          {' '}
          <code><i>thread_cpu_utilisation.txt</i></code>
          {' '}
          file to see this data.
        </h4>
      </main>
    );
  }
}
