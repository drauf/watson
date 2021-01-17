import React from 'react';
import { WithThreadDumpsProps } from '../common/withThreadDumps';

const NotFoundError: React.FunctionComponent<WithThreadDumpsProps> = () => (
  <h4 id="centered">Oops, you&apos;ve found a dead link!</h4>
);

export default NotFoundError;
