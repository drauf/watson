import React, { ComponentState } from 'react';
import ReactGA from 'react-ga';
import { Props } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import SimilarStacksGroup from './SimilarStacksGroup';
import './SimilarStacksPage.css';
import SimilarStacksSettings from './SimilarStacksSettings';

type State = {
  linesToConsider: number;
  minimalGroupSize: number;
  withoutIdle: boolean;
};

export default class SimilarStacksPage extends React.PureComponent<Props, State> {
  // tslint:disable-next-line:max-line-length
  private static NO_THREAD_DUMPS = 'You need to load the <i>thread_dump</i> files to see this data.';
  private static N0_THREADS_MATCHING = 'No stack traces match the selected criteria.';

  public state: State = {
    linesToConsider: 40,
    minimalGroupSize: 2,
    withoutIdle: true,
  };

  public render() {
    const threadGroups = this.groupByStackTrace(this.props.threadDumps, this.state.linesToConsider)
      .filter(group => group.length >= this.state.minimalGroupSize);

    return (
      <div id="similar-stacks-page">
        <SimilarStacksSettings
          linesToConsider={this.state.linesToConsider}
          minimalGroupSize={this.state.minimalGroupSize}
          withoutIdle={this.state.withoutIdle}
          onFilterChange={this.handleFilterChange}
          onSettingsChange={this.handleSettingsChange} />

        {!this.props.threadDumps.find(dump => dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: SimilarStacksPage.NO_THREAD_DUMPS }} />
          : threadGroups.length === 0
            ? <h4>{SimilarStacksPage.N0_THREADS_MATCHING}</h4>
            : threadGroups.map((group, index) => (
              <SimilarStacksGroup key={index}
                threadGroup={group}
                linesToConsider={this.state.linesToConsider} />))}
      </div>
    );
  }

  private handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };

    ReactGA.event({
      action: 'Similar Stacks settings changed',
      category: 'Navigation',
      label: `Filter ${name} changed to ${isChecked}`,
    });
    this.setState(newState);
  }

  private handleSettingsChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    let value: number = parseInt(event.target.value ? event.target.value : '0', 10);
    if (value < 0) {
      value = 0;
    }
    const newState: ComponentState = { [name]: value > 0 ? value : 0 };

    ReactGA.event({
      action: 'Similar Stacks settings changed',
      category: 'Navigation',
      label: `Setting ${name} changed to ${value}`,
    });
    this.setState(newState);
  }

  private groupByStackTrace(threadDumps: ThreadDump[], linesToConsider: number) {
    const grouped: Map<string, Thread[]> = new Map();

    threadDumps.forEach((threadDump) => {
      threadDump.threads.forEach((thread) => {
        const stackTrace = this.getStackTrace(thread, linesToConsider);

        if (!stackTrace) {
          return;
        }

        let similarStacks = grouped.get(stackTrace);
        if (!similarStacks) {
          similarStacks = [];
        }
        similarStacks.push(thread);

        grouped.set(stackTrace, similarStacks);
      });
    });

    return Array.from(grouped.values()).sort((t1, t2) => t2.length - t1.length);
  }

  private getStackTrace(thread: Thread, linesToConsider: number): string | null {
    // we assume that threads with stacks shorter than 17 don't do anything useful
    if (this.state.withoutIdle && thread.stackTrace.length < 17) {
      return null;
    }

    if (linesToConsider < 1) {
      return thread.stackTrace.toString();
    }

    return thread.stackTrace.slice(0, linesToConsider).toString();
  }
}
