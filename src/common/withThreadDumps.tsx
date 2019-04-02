import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';

export type WithThreadDumpsProps = RouteComponentProps<any> & {
  threadDumps: ThreadDump[];
};

type State = {
  promisePending: boolean;
  threadDumps: ThreadDump[];
};

export const withThreadDumps =
  <P extends WithThreadDumpsProps>(WrappedComponent: React.ComponentType<P>) => {
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

      public componentDidMount() {
        this.scrollToTop();
      }

      public render() {
        if (this.state.promisePending) {
          return <h4 id="centered">Loading data from cache...</h4>;
        }

        return <WrappedComponent threadDumps={this.state.threadDumps} {...this.props} />;
      }

      private scrollToTop = () => {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.scrollTop = 0;
        }
      }
    }

    return WithThreadDumps;
  };
