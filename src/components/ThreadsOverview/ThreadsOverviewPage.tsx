import React, { ComponentState } from 'react';
import ThreadDump from '../../types/ThreadDump';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import './ThreadsOverviewPage.css';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';
import ThreadsOverviewTable from './ThreadsOverviewTable';

type ThreadsOverviewPageProps = {
  threadDumps: ThreadDump[];
};

type ThreadsOverviewPageState = {
  nameFilter: string;
  stackFilter: string;
};

export default class ThreadsOverviewPage
  extends React.PureComponent<ThreadsOverviewPageProps, ThreadsOverviewPageState> {

  public state = {
    nameFilter: '',
    stackFilter: '',
  };

  public handleSettingsChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newState: ComponentState = { [event.target.name]: event.target.value };
    this.setState(newState);
  }

  public render() {
    if (!this.props.threadDumps.find(dump => dump.threads.length > 0)) {
      return (
        <h2>To see the Threads Overview you must upload at least one file with thread dumps.</h2>
      );
    }

    return (
      <div id="threads-overview-page">
        <ThreadsOverviewLegend />
        <ThreadsOverviewSettings
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onSettingsChange={this.handleSettingsChange}
        />
        <ThreadsOverviewTable
          threadDumps={this.props.threadDumps}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
        />
      </div>
    );
  }
}
