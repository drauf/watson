import React from 'react';
import { WithThreadDumpsProps } from '../common/withThreadDumps';

const NotFoundError: React.FunctionComponent<WithThreadDumpsProps> = () => (
  <main>
    <h4 id="centered">Oops, you&apos;ve found a dead link!</h4>
  </main>
);

export default NotFoundError;
