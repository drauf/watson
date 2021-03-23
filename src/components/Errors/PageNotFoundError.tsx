import React from 'react';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';

export default class PageNotFoundError extends React.PureComponent<WithThreadDumpsProps> {
  public render(): JSX.Element {
    return (
      <main id="error">
        <h4>Oops, you&apos;ve found a dead link!</h4>
      </main>
    );
  }
}
