import React from 'react';

export default class NoThreadDumpsError extends React.PureComponent {
  public render(): JSX.Element {
    return (
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
  }
}
