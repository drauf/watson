import PageWithSettings from '../PageWithSettings';
import { WithThreadCpuUsageProps } from '../../common/withCpuConsumersJfrData';
import CpuUsageJfr from '../../parser/cpuusage/jfr/CpuUsageJfr';
import NoCpuConsumersJfrDataError from '../Errors/NoCpuConsumersJfrDataError';
import CpuConsumersJfrList from './CpuConsumersJfrList';
import './CpuConsumersJfrPage.css';

type State = {
  cpuUsageJfrList: CpuUsageJfr[];
};

export default class CpuConsumersJfrPage extends PageWithSettings<WithThreadCpuUsageProps, State> {
  constructor(props: WithThreadCpuUsageProps) {
    super(props);

    this.state = {
      cpuUsageJfrList: this.props.cpuUsageJfrList,
    };
  }

  public render(): JSX.Element {
    if (!this.state.cpuUsageJfrList.some((dump: CpuUsageJfr) => !!dump.threadCpuUsages)) {
      return <NoCpuConsumersJfrDataError />;
    }

    return (
      <main>
        <ul id="consumers-list">
          <CpuConsumersJfrList cpuUsageJfrList={this.state.cpuUsageJfrList} />
        </ul>
      </main>
    );
  }
}
