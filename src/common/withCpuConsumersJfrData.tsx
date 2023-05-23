import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { getCpuUsageJfrAsync } from './threadDumpsStorageService';
import CpuUsageJfr from '../parser/cpuusage/jfr/CpuUsageJfr';

export type WithThreadCpuUsageProps = RouteComponentProps<{ key: string }> & {
  cpuUsageJfrList: CpuUsageJfr[];
};

type State = {
  promisePending: boolean;
  cpuUsageJfrList: CpuUsageJfr[];
};

export const withCpuConsumersJfrData = <P extends WithThreadCpuUsageProps>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> => {
  class WithCpuConsumersJfrData extends React.PureComponent<P, State> {
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
        cpuUsageJfrList: [],
      };

      const { key } = props.match.params;
      getCpuUsageJfrAsync(key)
        .then((cpuUsageJfrList) => {
          this.setState({ cpuUsageJfrList, promisePending: false });
        })
        .catch((error) => console.error(error));
    }

    public componentDidMount() {
      WithCpuConsumersJfrData.scrollToTop();
    }

    public render(): JSX.Element {
      const { promisePending, cpuUsageJfrList } = this.state;

      if (promisePending) {
        return <main id="centered"><h4>Loading data from cache...</h4></main>;
      }

      // eslint-disable-next-line react/jsx-props-no-spreading
      return <WrappedComponent {...this.props} cpuUsageJfrList={cpuUsageJfrList} />;
    }
  }

  return WithCpuConsumersJfrData;
};
