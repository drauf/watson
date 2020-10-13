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

export const
  withThreadDumps = <P extends WithThreadDumpsProps>(WrappedComponent: React.ComponentType<P>) => {
    class WithThreadDumps extends React.Component<P, State> {
      constructor(props: P) {
        super(props);
        this.state = {
          promisePending: true,
          threadDumps: [],
        };

        const { key } = props.match.params;
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

      private scrollToTop = () => {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.scrollTop = 0;
        }
      }

      public render() {
        const { promisePending, threadDumps } = this.state;

        if (promisePending) {
          return <h4 id="centered">Loading data from cache...</h4>;
        }

        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WrappedComponent {...this.props} threadDumps={threadDumps} />;
      }
    }

    return WithThreadDumps;
  };
