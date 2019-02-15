import React, { ComponentState } from 'react';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import SimilarStacksGroup from './SimilarStacksGroup';
import './SimilarStacksPage.css';
import SimilarStacksSettings from './SimilarStacksSettings';

type SimilarStacksPageProps = {
  threadDumps: ThreadDump[];
};

type SimilarStacksPageState = {
  linesToConsider: number;
  minimalGroupSize: number;
};

export default class SimilarStacksPage
  extends React.PureComponent<SimilarStacksPageProps, SimilarStacksPageState> {
  // tslint:disable-next-line:max-line-length
  private static NO_THREAD_DUMPS_MESSGE = 'To see the Similar Stack Traces you must upload at least one file with thread dumps.';

  public state: SimilarStacksPageState = {
    linesToConsider: 40,
    minimalGroupSize: 2,
  };

  public render() {
    if (!this.props.threadDumps.find(dump => dump.threads.length > 0)) {
      return (
        <h2>{SimilarStacksPage.NO_THREAD_DUMPS_MESSGE}</h2>
      );
    }

    const threadGroups = this.groupByStackTrace(this.props.threadDumps, this.state.linesToConsider);
    return (
      <div id="similar-stacks-page">
        <SimilarStacksSettings
          linesToConsider={this.state.linesToConsider}
          minimalGroupSize={this.state.minimalGroupSize}
          onSettingsChange={this.handleSettingsChange} />

        {threadGroups.map((group, index) => (
          <SimilarStacksGroup key={index}
            threadGroup={group}
            linesToConsider={this.state.linesToConsider}
            minimalGroupSize={this.state.minimalGroupSize} />))}
      </div>
    );
  }

  private handleSettingsChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value: number = parseInt(event.target.value ? event.target.value : '0', 10);
    const newState: ComponentState = { [event.target.name]: value > 0 ? value : 0 };
    this.setState(newState);
  }

  private groupByStackTrace(threadDumps: ThreadDump[], linesToConsider: number) {
    const grouped: Map<string, Thread[]> = new Map();

    threadDumps.forEach((threadDump) => {
      threadDump.threads.forEach((thread) => {
        const stackTrace = this.getStackTrace(thread, linesToConsider);

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

  private getStackTrace(thread: Thread, linesToConsider: number): string {
    if (linesToConsider < 1) {
      return thread.stackTrace.toString();
    }

    return thread.stackTrace.slice(0, linesToConsider).toString();
  }
}
