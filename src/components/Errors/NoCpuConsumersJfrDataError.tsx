import React from 'react';

export default class NoCpuConsumersJfrDataError extends React.PureComponent {
  public render(): JSX.Element {
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
