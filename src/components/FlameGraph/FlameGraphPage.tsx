import React from 'react';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';

export default class FlameGraphPage extends React.PureComponent<WithThreadDumpsProps> {
  public render() {
    const { threadDumps } = this.props;

    if (!threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    return (
      <main>
        Flame graph page
      </main>
    );
  }
}
