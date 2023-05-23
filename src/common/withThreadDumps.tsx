import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';

export type WithThreadDumpsProps = RouteComponentProps<{ key: string }> & {
  threadDumps: ThreadDump[];
};

type State = {
  promisePending: boolean;
  threadDumps: ThreadDump[];
};

export const withThreadDumps = <P extends WithThreadDumpsProps>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> => {
  class WithThreadDumps extends React.PureComponent<P, State> {
    private static scrollToTop = () => {
      const rootDiv = document.getElementById('root');
      if (rootDiv) {
        rootDiv.scrollTop = 0;
      }
    };

    constructor(props: P) {
      super(props);
      this.state = {
        promisePending: true,
        threadDumps: [],
      };

      const { key } = props.match.params;
      getThreadDumpsAsync(key)
        .then((threadDumps) => {
          this.setState({ threadDumps, promisePending: false });
        })
        .catch((error) => console.error(error));
    }

    public componentDidMount() {
      WithThreadDumps.scrollToTop();
    }

    public render(): JSX.Element {
      const { promisePending, threadDumps } = this.state;

      if (promisePending) {
        return <main id="centered"><h4>Loading data from cache...</h4></main>;
      }

      // eslint-disable-next-line react/jsx-props-no-spreading
      return <WrappedComponent {...this.props} threadDumps={threadDumps} />;
    }
  }

  return WithThreadDumps;
};
