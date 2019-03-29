import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';

export type Props = RouteComponentProps<any> & {
  threadDumps: ThreadDump[];
};

type State = {
  promisePending: boolean;
  threadDumps: ThreadDump[];
};

export const withThreadDumps = <P extends Props>(WrappedComponent: React.ComponentType<P>) => {
  class WithThreadDumps extends React.Component<P, State> {
    public state: State = {
      promisePending: true,
      threadDumps: [],
    };

    constructor(props: P) {
      super(props);

      const key: string = props.match.params.key;
      const threadDumpsPromise = getThreadDumpsAsync(key);

      threadDumpsPromise
        .then((threadDumps) => {
          if (threadDumps.length === 0) {
            props.history.push('/');
          }
          return threadDumps;
        })
        .then((threadDumps) => {
          this.setState({ threadDumps, promisePending: false });
        });
    }

    public render() {
      if (this.state.promisePending) {
        return <>Loading data from cache...</>;
      }

      return <WrappedComponent threadDumps={this.state.threadDumps} {...this.props} />;
    }
  }

  return WithThreadDumps;
};
